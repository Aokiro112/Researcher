import { EvidenceItem, EvidenceType, ExtractedPassage, ResearchPlan } from './types';

// Metric patterns (numbers, percentages, currencies, memory sizes, clock speeds, tokens/sec)
const METRIC_REGEX = /\b(\d+(?:\.\d+)?\s*(?:%|GB|TB|MB|GHz|MHz|TFLOPS|W|watts?|tokens?\/s|fps|\$|€|£|₹|ms|seconds?))\b/i;
const SPEC_REGEX = /\b(VRAM|bandwidth|CUDA|ROCm|architecture|memory bus|cores?|TDP|price|cost|release date|version)\b/i;
const OPINION_MARKERS = /\b(best|worst|revolutionary|incredible|disappointing|subjective|arguably|opinion|feel|recommend)\b/i;
const UNCERTAINTY_MARKERS = /\b(rumor|unconfirmed|expected|allegedly|may|might|estimated|likely|projected)\b/i;

export function extractEvidenceFromPassages(
  passages: ExtractedPassage[],
  plan: ResearchPlan
): EvidenceItem[] {
  const evidenceList: EvidenceItem[] = [];
  const seenClaims = new Set<string>();

  for (const passage of passages) {
    // Break passage into sentences
    const rawSentences = passage.text
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 25);

    for (let sIdx = 0; sIdx < rawSentences.length; sIdx++) {
      const sentence = rawSentences[sIdx];
      const lower = sentence.toLowerCase();

      // Check if sentence contains meaningful technical claim or metric
      const hasMetric = METRIC_REGEX.test(sentence);
      const hasSpec = SPEC_REGEX.test(sentence);
      const isOpinion = OPINION_MARKERS.test(sentence);
      const isUncertain = UNCERTAINTY_MARKERS.test(sentence);

      // Determine evidence type
      let type: EvidenceType = 'FACT';
      let confidence = 0.85;

      if (hasMetric) {
        type = 'METRIC';
        confidence = 0.92;
      } else if (isUncertain) {
        type = 'UNCERTAIN';
        confidence = 0.55;
      } else if (isOpinion) {
        type = 'OPINION';
        confidence = 0.65;
      }

      // Map to research dimension
      let matchedDimension = 'General';
      for (const dim of plan.dimensions) {
        const dimKeywords = dim.name.toLowerCase().split(/\s+/);
        if (dimKeywords.some((kw) => lower.includes(kw))) {
          matchedDimension = dim.name;
          break;
        }
      }

      // Deduplicate similar claims
      const claimKey = sentence.slice(0, 60).toLowerCase();
      if (!seenClaims.has(claimKey)) {
        seenClaims.add(claimKey);

        evidenceList.push({
          id: `ev_${passage.sourceOrdinal}_${sIdx}`,
          claim: sentence,
          evidenceSnippet: sentence,
          sourceOrdinal: passage.sourceOrdinal,
          sourceUrl: passage.sourceUrl,
          sourceDomain: passage.sourceDomain,
          confidence,
          relevance: passage.relevanceScore >= 6 ? 0.9 : 0.7,
          type,
          dimension: matchedDimension,
        });
      }

      if (evidenceList.length >= 35) break;
    }

    if (evidenceList.length >= 35) break;
  }

  return evidenceList;
}
