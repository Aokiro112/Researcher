import { QueryAnalysis, QueryIntent, ResearchDepth } from './types';

// URL / Domain regex matching
const URL_REGEX = /(https?:\/\/[^\s]+)/i;
const DOMAIN_REGEX = /\b([a-zA-Z0-9-]+\.(?:com|org|in|io|co\.in|net|edu|ai|gov|dev|app|me))\b/i;

const COMPARISON_KEYWORDS = ['vs', 'versus', 'compare', 'difference between', 'better than', 'or'];
const FRESHNESS_KEYWORDS = ['2025', '2026', 'latest', 'current', 'recent', 'today', 'now', 'newest', 'roadmap'];
const TECHNICAL_KEYWORDS = [
  'architecture', 'benchmark', 'gpu', 'cpu', 'vram', 'cuda', 'rocm', 'performance',
  'latency', 'framework', 'protocol', 'algorithm', 'api', 'model', 'weights', 'inference',
  'throughput', 'docker', 'kubernetes', 'llm', 'system', 'engine'
];

export function analyzeQuery(rawQuery: string, forcedMode?: string): QueryAnalysis {
  const query = rawQuery.trim();

  // 1. Detect direct URL or Domain
  let targetUrl: string | undefined;
  let targetDomain: string | undefined;

  const urlMatch = query.match(URL_REGEX);
  if (urlMatch) {
    targetUrl = urlMatch[1];
    try {
      targetDomain = new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {}
  } else {
    const domainMatch = query.match(DOMAIN_REGEX);
    if (domainMatch) {
      targetDomain = domainMatch[1].toLowerCase();
      targetUrl = `https://${targetDomain}`;
    }
  }

  // 2. Comparison detection
  const lower = query.toLowerCase();
  const isComparison = COMPARISON_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(lower);
  });

  // 3. Freshness detection
  const isFreshnessRequired = FRESHNESS_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(lower);
  });

  // 4. Intent Classification
  let intent: QueryIntent = 'FACTUAL';
  if (targetUrl || lower.includes('content') && targetDomain) {
    intent = 'URL_EXTRACTION';
  } else if (isComparison) {
    intent = 'COMPARISON';
  } else if (isFreshnessRequired) {
    intent = 'CURRENT_EVENT';
  } else if (TECHNICAL_KEYWORDS.some((kw) => lower.includes(kw))) {
    intent = 'TECHNICAL';
  } else if (query.split(' ').length > 6 || lower.startsWith('research') || lower.startsWith('explain in detail')) {
    intent = 'EXPLORATORY';
  }

  // 5. Complexity Scoring (1-10)
  let complexityScore = 3;
  if (isComparison) complexityScore += 3;
  if (isFreshnessRequired) complexityScore += 1;
  if (TECHNICAL_KEYWORDS.some((kw) => lower.includes(kw))) complexityScore += 2;
  if (query.split(' ').length > 8) complexityScore += 1;
  if (targetUrl) complexityScore = Math.min(complexityScore, 5); // URL extraction is targeted
  complexityScore = Math.min(10, Math.max(1, complexityScore));

  // 6. Research Depth Determination
  let depth: ResearchDepth = 'NORMAL';
  if (forcedMode === 'deep_research') {
    depth = 'DEEP_RESEARCH';
  } else if (forcedMode === 'search') {
    depth = complexityScore >= 6 ? 'RESEARCH' : 'NORMAL';
  } else {
    if (complexityScore >= 8) depth = 'DEEP_RESEARCH';
    else if (complexityScore >= 5) depth = 'RESEARCH';
    else depth = 'NORMAL';
  }

  // 7. Extract Candidate Entities
  const entities: string[] = [];
  if (isComparison) {
    // Attempt to split entities like "RTX 5070 vs RX 9070"
    const splitParts = query.split(/\b(?:vs|versus|compared to)\b/i);
    if (splitParts.length >= 2) {
      entities.push(
        splitParts[0].replace(/^(?:compare|how does|is)\s+/i, '').trim(),
        splitParts[1].replace(/(?:for.*|in.*|\?)$/i, '').trim()
      );
    }
  }

  // Clean query for search
  const cleanQuery = query.replace(/[?.,!]+$/, '').trim();

  // Candidate dimensions
  const dimensions: string[] = [];
  if (intent === 'COMPARISON') {
    dimensions.push(
      'Core Specifications & Architecture',
      'Benchmark Performance & Efficiency',
      'Software Ecosystem & Support',
      'Value & Practical Recommendation'
    );
  } else if (intent === 'URL_EXTRACTION') {
    dimensions.push('Primary Content & Overview', 'Key Features & Navigation');
  } else if (intent === 'TECHNICAL') {
    dimensions.push('Technical Mechanics & Specifications', 'Real-world Implementations & Trade-offs');
  } else {
    dimensions.push('Overview & Key Insights', 'Context & Details');
  }

  return {
    originalQuery: query,
    cleanQuery,
    intent,
    depth,
    isFreshnessRequired,
    isComparison,
    targetUrl,
    targetDomain,
    entities,
    dimensions,
    complexityScore,
  };
}
