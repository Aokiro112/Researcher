import { SourceItem } from '../types/thread';
import { EvidenceItem, VerifiedCitation } from './types';

export function validateAndCleanCitations(
  rawMarkdown: string,
  sources: SourceItem[],
  evidence: EvidenceItem[]
): {
  cleanedMarkdown: string;
  verifiedCitations: VerifiedCitation[];
} {
  const maxValidOrdinal = sources.length;
  const citationCounts = new Map<number, number>();

  // Count evidence items per source
  const evidenceCountPerSource = new Map<number, number>();
  for (const ev of evidence) {
    const c = evidenceCountPerSource.get(ev.sourceOrdinal) || 0;
    evidenceCountPerSource.set(ev.sourceOrdinal, c + 1);
  }

  // Sanitize citations: if a citation [N] exceeds maxValidOrdinal, map it or remove it
  const cleanedMarkdown = rawMarkdown.replace(/\[(\d+)\]/g, (match, numStr) => {
    const num = parseInt(numStr, 10);
    if (num >= 1 && num <= maxValidOrdinal) {
      citationCounts.set(num, (citationCounts.get(num) || 0) + 1);
      return match;
    } else {
      // Hallucinated citation index: fallback to [1] or strip
      if (maxValidOrdinal >= 1) {
        citationCounts.set(1, (citationCounts.get(1) || 0) + 1);
        return '[1]';
      }
      return '';
    }
  });

  const verifiedCitations: VerifiedCitation[] = [];
  for (const source of sources) {
    const citedCount = citationCounts.get(source.ordinal) || 0;
    const evCount = evidenceCountPerSource.get(source.ordinal) || 0;

    if (citedCount > 0 || evCount > 0) {
      verifiedCitations.push({
        ordinal: source.ordinal,
        sourceUrl: source.url,
        sourceTitle: source.title,
        sourceDomain: source.domain,
        supportingEvidenceCount: Math.max(citedCount, evCount),
      });
    }
  }

  return {
    cleanedMarkdown,
    verifiedCitations,
  };
}
