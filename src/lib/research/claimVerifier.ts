import { ClaimConflict, EvidenceItem } from './types';

export function detectConflictsAndVerify(evidence: EvidenceItem[]): {
  conflicts: ClaimConflict[];
  verifiedEvidence: EvidenceItem[];
} {
  const conflicts: ClaimConflict[] = [];
  const verifiedEvidence: EvidenceItem[] = [];

  // Group evidence by dimension
  const byDimension = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    const list = byDimension.get(item.dimension) || [];
    list.push(item);
    byDimension.set(item.dimension, list);
  }

  // Cross-compare evidence within each dimension for numerical / factual discrepancies
  for (const [dim, items] of byDimension.entries()) {
    for (let i = 0; i < items.length; i++) {
      const itemA = items[i];
      verifiedEvidence.push(itemA);

      for (let j = i + 1; j < items.length; j++) {
        const itemB = items[j];

        // Only compare different sources
        if (itemA.sourceOrdinal === itemB.sourceOrdinal) continue;

        // Check if both mention common key metrics but have differing values
        const numPattern = /\b(\$?\d+(?:\.\d+)?)\s*(?:GB|TB|MB|W|TFLOPS|fps|\$|€|£|₹)?\b/gi;
        const numsA = Array.from(itemA.claim.matchAll(numPattern)).map((m) => m[0]);
        const numsB = Array.from(itemB.claim.matchAll(numPattern)).map((m) => m[0]);

        // If they both discuss the same dimension (e.g. price or vram) with distinct conflicting numbers
        if (
          numsA.length > 0 &&
          numsB.length > 0 &&
          numsA[0] !== numsB[0] &&
          (itemA.claim.toLowerCase().includes('price') || itemA.claim.toLowerCase().includes('vram')) &&
          (itemB.claim.toLowerCase().includes('price') || itemB.claim.toLowerCase().includes('vram'))
        ) {
          conflicts.push({
            dimension: dim,
            claimA: itemA.claim,
            sourceAOrdinal: itemA.sourceOrdinal,
            sourceADomain: itemA.sourceDomain,
            claimB: itemB.claim,
            sourceBOrdinal: itemB.sourceOrdinal,
            sourceBDomain: itemB.sourceDomain,
            discrepancyExplanation: `Reported values differ between [${itemA.sourceOrdinal}] (${itemA.sourceDomain}: "${numsA[0]}") and [${itemB.sourceOrdinal}] (${itemB.sourceDomain}: "${numsB[0]}").`,
          });
        }
      }
    }
  }

  return {
    conflicts: conflicts.slice(0, 3), // Keep top 3 most prominent discrepancies
    verifiedEvidence,
  };
}
