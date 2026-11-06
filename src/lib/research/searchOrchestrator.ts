import { SourceItem } from '../types/thread';
import { executeSearch } from '../search/searchEngine';
import { ResearchPlan } from './types';
import { researchCache } from './cache';

function canonicalizeUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Remove analytics / tracking query parameters
    const paramsToKeep = new URLSearchParams();
    for (const [key, value] of u.searchParams.entries()) {
      if (!key.startsWith('utm_') && !key.startsWith('fbclid') && !key.startsWith('gclid') && key !== 'ref') {
        paramsToKeep.append(key, value);
      }
    }
    u.search = paramsToKeep.toString();
    u.hash = ''; // Remove fragments
    return u.toString().replace(/\/$/, ''); // Remove trailing slash
  } catch {
    return rawUrl.trim();
  }
}

function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'web';
  }
}

const HIGH_AUTHORITY_DOMAINS = new Set([
  'github.com', 'wikipedia.org', 'en.wikipedia.org', 'arxiv.org', 'nasa.gov',
  'nature.com', 'sciencedirect.com', 'developer.nvidia.com', 'amd.com', 'intel.com',
  'docs.python.org', 'pytorch.org', 'huggingface.co', 'microsoft.com', 'apple.com',
  'reuters.com', 'bloomberg.com', 'mit.edu', 'stanford.edu', 'ieee.org'
]);

export async function orchestrateSearch(
  plan: ResearchPlan,
  onProgress?: (msg: string, count: number) => void
): Promise<SourceItem[]> {
  const { queryAnalysis, dimensions, maxSourcesToFetch } = plan;
  const targetDomain = queryAnalysis.targetDomain?.toLowerCase();
  const targetUrl = queryAnalysis.targetUrl;

  const candidateSources: SourceItem[] = [];
  const seenCanonicalUrls = new Set<string>();

  // 1. If a direct target URL is detected, immediately seed it as the primary source!
  if (targetUrl) {
    const canonTarget = canonicalizeUrl(targetUrl);
    seenCanonicalUrls.add(canonTarget);
    candidateSources.push({
      title: `${targetDomain || 'Target Site'} Official Resource`,
      url: targetUrl,
      domain: targetDomain || extractDomain(targetUrl),
      snippet: `Direct verified target page: ${targetUrl}`,
      isTrusted: true,
      ordinal: 1,
    });
  }

  // 2. Gather unique search queries from all dimensions
  const allQueries: { query: string; dimensionId: string }[] = [];
  const querySet = new Set<string>();

  for (const dim of dimensions) {
    for (const q of dim.searchQueries) {
      const trimmed = q.trim();
      if (trimmed && !querySet.has(trimmed.toLowerCase())) {
        querySet.add(trimmed.toLowerCase());
        allQueries.push({ query: trimmed, dimensionId: dim.id });
      }
    }
  }

  // 3. Parallel search execution with concurrency pool limit
  const CONCURRENCY_LIMIT = 3;
  let queryIndex = 0;

  async function worker() {
    while (queryIndex < allQueries.length) {
      const current = allQueries[queryIndex++];
      if (!current) break;

      const { query } = current;
      try {
        // Check cache first
        let results = researchCache.getSearch(query);
        if (!results) {
          results = await executeSearch(query, 5);
          researchCache.setSearch(query, results, 1000 * 60 * 15);
        }

        for (const item of results) {
          const canon = canonicalizeUrl(item.url);
          if (!seenCanonicalUrls.has(canon)) {
            seenCanonicalUrls.add(canon);
            candidateSources.push({
              ...item,
              url: canon,
              domain: extractDomain(canon),
            });
          }
        }

        if (onProgress) {
          onProgress(`Retrieved sources across research dimensions...`, candidateSources.length);
        }
      } catch (err) {
        console.warn(`Search failed for query "${query}":`, err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, allQueries.length) }, () => worker());
  await Promise.all(workers);

  // 4. Source Scoring & Diversity Enforcement
  // Domain diversity: max 2 items per domain unless it's the targetDomain
  const domainCounts = new Map<string, number>();

  const scoredSources = candidateSources.map((source) => {
    let score = 5;
    const dom = source.domain.toLowerCase();

    // Target domain gets massive boost
    if (targetDomain && dom.includes(targetDomain)) score += 20;

    // High authority domains get boost
    if (HIGH_AUTHORITY_DOMAINS.has(dom) || dom.endsWith('.edu') || dom.endsWith('.gov')) {
      score += 8;
    }

    // Query term match boost in title
    const titleLower = source.title.toLowerCase();
    const queryTokens = queryAnalysis.cleanQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 2;
    }

    return { source, score, domain: dom };
  });

  // Sort descending by score
  scoredSources.sort((a, b) => b.score - a.score);

  const finalSources: SourceItem[] = [];
  const maxPerDomain = targetDomain ? 4 : 2;

  for (const { source, domain } of scoredSources) {
    const currentCount = domainCounts.get(domain) || 0;
    if (currentCount >= maxPerDomain && domain !== targetDomain) {
      continue;
    }

    domainCounts.set(domain, currentCount + 1);
    finalSources.push(source);

    if (finalSources.length >= maxSourcesToFetch) break;
  }

  // Assign contiguous 1-based ordinals
  return finalSources.map((s, idx) => ({
    ...s,
    ordinal: idx + 1,
  }));
}
