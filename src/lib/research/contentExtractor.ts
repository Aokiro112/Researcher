import * as cheerio from 'cheerio';
import { SourceItem } from '../types/thread';
import { ExtractedPassage, ResearchPlan } from './types';
import { researchCache } from './cache';

function extractTableContent($: cheerio.CheerioAPI, tableEl: cheerio.Cheerio<any>): string {
  const rows: string[] = [];
  tableEl.find('tr').each((_, tr) => {
    const cells: string[] = [];
    $(tr).find('th, td').each((_, cell) => {
      const text = $(cell).text().trim().replace(/\s+/g, ' ');
      if (text) cells.push(text);
    });
    if (cells.length > 0) {
      rows.push(cells.join(' | '));
    }
  });
  return rows.join('\n');
}

export async function extractPassagesFromSources(
  sources: SourceItem[],
  plan: ResearchPlan,
  onProgress?: (scrapedCount: number, total: number) => void
): Promise<ExtractedPassage[]> {
  const { maxPassagesToExtract, queryAnalysis } = plan;
  const targetSources = sources.slice(0, plan.maxSourcesToFetch);

  const queryTerms = [
    ...queryAnalysis.cleanQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 2),
    ...queryAnalysis.entities.map((e) => e.toLowerCase()),
    ...queryAnalysis.dimensions.flatMap((d) => d.toLowerCase().split(/\s+/)),
  ];

  const extractedPassages: ExtractedPassage[] = [];
  const CONCURRENCY = 3;
  let index = 0;
  let completedCount = 0;

  async function worker() {
    while (index < targetSources.length) {
      const source = targetSources[index++];
      if (!source) break;

      // Check cache first
      const cached = researchCache.getPage(source.url);
      if (cached && cached.length > 0) {
        // Remap source ordinal in case ordering changed
        for (const p of cached) {
          extractedPassages.push({
            ...p,
            sourceOrdinal: source.ordinal,
          });
        }
        completedCount++;
        if (onProgress) onProgress(completedCount, targetSources.length);
        continue;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);

          // Remove noise
          $(
            'script, style, noscript, nav, header, footer, svg, iframe, form, button, .ads, .advertisement, [role="navigation"], [role="banner"]'
          ).remove();

          const pageTitle = $('title').text().trim() || source.title;

          // 1. Check for data tables first
          const tablePassages: ExtractedPassage[] = [];
          $('table').each((tIdx, tbl) => {
            const tableText = extractTableContent($, $(tbl));
            if (tableText.length > 30) {
              tablePassages.push({
                id: `tbl_${source.ordinal}_${tIdx}`,
                sourceUrl: source.url,
                sourceOrdinal: source.ordinal,
                sourceTitle: pageTitle,
                sourceDomain: source.domain,
                heading: $(tbl).prev('h1, h2, h3, h4').text().trim() || 'Data Table',
                text: tableText.slice(0, 800),
                relevanceScore: 9, // Tables are dense with quantitative evidence
                containsTable: true,
              });
            }
          });

          // 2. Extract structured paragraphs with headings
          const rawSections: { heading?: string; text: string }[] = [];
          $('h1, h2, h3, p, li').each((_, el) => {
            const tag = el.tagName.toLowerCase();
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.length > 35) {
              if (tag.startsWith('h')) {
                rawSections.push({ heading: text, text: '' });
              } else {
                const last = rawSections[rawSections.length - 1];
                if (last && last.text.length < 500) {
                  last.text += (last.text ? ' ' : '') + text;
                } else {
                  rawSections.push({ text });
                }
              }
            }
          });

          // Filter meaningful passages and score relevance
          const pagePassages: ExtractedPassage[] = [...tablePassages];

          for (let pIdx = 0; pIdx < rawSections.length; pIdx++) {
            const sec = rawSections[pIdx];
            if (!sec.text || sec.text.length < 50) continue;

            const textLower = sec.text.toLowerCase();
            let score = 2;

            for (const term of queryTerms) {
              if (textLower.includes(term)) {
                score += 2;
              }
            }

            if (score >= 4 || pagePassages.length < 2) {
              pagePassages.push({
                id: `p_${source.ordinal}_${pIdx}`,
                sourceUrl: source.url,
                sourceOrdinal: source.ordinal,
                sourceTitle: pageTitle,
                sourceDomain: source.domain,
                heading: sec.heading,
                text: sec.text.slice(0, 900),
                relevanceScore: score,
              });
            }
          }

          // Cache parsed passages for this URL
          researchCache.setPage(source.url, pagePassages, 1000 * 60 * 30);

          extractedPassages.push(...pagePassages);
        } else {
          // If fetch returned error status, fallback to search snippet
          if (source.snippet) {
            extractedPassages.push({
              id: `snip_${source.ordinal}`,
              sourceUrl: source.url,
              sourceOrdinal: source.ordinal,
              sourceTitle: source.title,
              sourceDomain: source.domain,
              text: source.snippet,
              relevanceScore: 3,
            });
          }
        }
      } catch {
        // Fallback gracefully on timeout / network error
        if (source.snippet) {
          extractedPassages.push({
            id: `snip_${source.ordinal}`,
            sourceUrl: source.url,
            sourceOrdinal: source.ordinal,
            sourceTitle: source.title,
            sourceDomain: source.domain,
            text: source.snippet,
            relevanceScore: 3,
          });
        }
      } finally {
        completedCount++;
        if (onProgress) onProgress(completedCount, targetSources.length);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, targetSources.length) }, () => worker());
  await Promise.all(workers);

  // Sort passages by relevance score descending
  extractedPassages.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return extractedPassages.slice(0, maxPassagesToExtract);
}
