import { SourceItem, ExecutionStep } from '../types/thread';
import { executeSearch } from './searchEngine';
import { scrapeUrl } from './scraper';

export interface DeepResearchPlan {
  subQueries: string[];
  allSources: SourceItem[];
  scrapedContent: Array<{ url: string; title: string; text: string }>;
}

export async function runDeepResearchPlanning(
  query: string,
  onStepUpdate?: (step: ExecutionStep) => void
): Promise<DeepResearchPlan> {
  // Step A: Generate 3 sub-queries
  const subQueries = [
    `${query} fundamental concepts mechanisms`,
    `${query} latest developments current status 2025 2026`,
    `${query} challenges criticism alternatives comparative analysis`,
  ];

  if (onStepUpdate) {
    onStepUpdate({
      stepType: 'MULTI_QUERY',
      status: 'RUNNING',
      content: { subQueries },
    });
  }

  // Step B: Parallel execution of sub-queries
  const searchPromises = subQueries.map((subQ) => executeSearch(subQ, 4));
  const searchResultsNested = await Promise.all(searchPromises);

  // Flatten and deduplicate sources by domain & title
  const seenUrls = new Set<string>();
  const combinedSources: SourceItem[] = [];

  for (const list of searchResultsNested) {
    for (const item of list) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        combinedSources.push({
          ...item,
          ordinal: combinedSources.length + 1,
        });
      }
    }
  }

  // Step C: Scrape top 3 unique content pages in parallel
  const topSourcesToScrape = combinedSources.slice(0, 3);
  const scrapePromises = topSourcesToScrape.map(async (src) => {
    try {
      const page = await scrapeUrl(src.url, 4000);
      return {
        url: src.url,
        title: src.title,
        text: page?.text ? page.text.slice(0, 800) : (src.snippet || ''),
      };
    } catch {
      return {
        url: src.url,
        title: src.title,
        text: src.snippet || '',
      };
    }
  });

  const scrapedContent = await Promise.all(scrapePromises);

  // Update snippets on matched sources
  for (const scraped of scrapedContent) {
    const matched = combinedSources.find((s) => s.url === scraped.url);
    if (matched && scraped.text) {
      matched.snippet = scraped.text.slice(0, 300);
    }
  }

  if (onStepUpdate) {
    onStepUpdate({
      stepType: 'MULTI_QUERY',
      status: 'COMPLETED',
      content: {
        subQueries,
        sourcesCount: combinedSources.length,
      },
    });
  }

  return {
    subQueries,
    allSources: combinedSources.slice(0, 10),
    scrapedContent,
  };
}
