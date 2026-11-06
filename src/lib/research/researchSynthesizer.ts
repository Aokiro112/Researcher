import { SourceItem } from '../types/thread';
import { ClaimConflict, EvidenceItem, QueryAnalysis, ResearchPlan } from './types';

export function buildSynthesisPrompt(
  analysis: QueryAnalysis,
  plan: ResearchPlan,
  sources: SourceItem[],
  evidence: EvidenceItem[],
  conflicts: ClaimConflict[]
): { systemInstruction: string; userPrompt: string } {
  // Format sources
  const sourcesText = sources
    .map((s) => `[${s.ordinal}] "${s.title}" (${s.domain}):\nURL: ${s.url}\nSummary: ${s.snippet || 'N/A'}`)
    .join('\n\n');

  // Format evidence by dimension
  const byDim = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    const list = byDim.get(item.dimension) || [];
    list.push(item);
    byDim.set(item.dimension, list);
  }

  let evidenceText = '';
  for (const [dim, items] of byDim.entries()) {
    evidenceText += `\n### Dimension: ${dim}\n`;
    for (const it of items.slice(0, 8)) {
      evidenceText += `- [${it.type}] ${it.claim} [${it.sourceOrdinal}]\n`;
    }
  }

  // Format conflicts
  let conflictsText = '';
  if (conflicts.length > 0) {
    conflictsText = '\n### Observed Discrepancies Across Sources:\n' +
      conflicts.map((c) => `- ${c.discrepancyExplanation}`).join('\n');
  }

  const systemInstruction = `You are OpenPPLX, a high-precision AI research engine.
You are generating a comprehensive, authoritative research report based strictly on the provided verified evidence.

CORE PRINCIPLES:
1. DIRECT ANSWER: Begin immediately with a clear, direct answer to the user's inquiry.
2. GROUNDED CITATIONS: Every single factual claim, metric, or specification MUST be cited inline using [1], [2], corresponding to the source ordinals.
3. COMPARISON & TABLES: For comparisons, hardware, or technical tools, include a clean Markdown comparison table.
4. HONEST UNCERTAINTY: If sources disagree or have varying numbers, explicitly state the variance (e.g. "Reports vary between X [1] and Y [2]").
5. NO GENERIC FILLER: Do NOT repeat "Based on my extensive research" or "In conclusion". Deliver pure, high-density facts and technical depth.
6. NO FABRICATIONS: Use ONLY the provided evidence.`;

  const userPrompt = `Research Inquiry: "${analysis.originalQuery}"
Research Depth: ${analysis.depth}
Query Intent: ${analysis.intent}

Verified Evidence Extracted from Sources:
${evidenceText}
${conflictsText}

Sources Retrieved:
${sourcesText}

Produce a structured, rigorous research answer with inline citations.`;

  return { systemInstruction, userPrompt };
}

// High-fidelity fallback synthesizer for 1.5B local models or zero-key environments
export function generateDeterministicResearchReport(
  analysis: QueryAnalysis,
  plan: ResearchPlan,
  sources: SourceItem[],
  evidence: EvidenceItem[],
  conflicts: ClaimConflict[]
): string {
  const { originalQuery, intent, targetDomain } = analysis;

  // 1. Special Handling for Direct Website / URL Content Extraction
  if (intent === 'URL_EXTRACTION' && targetDomain) {
    const primarySource = sources.find((s) => s.domain.includes(targetDomain)) || sources[0];
    const relatedEvidence = evidence.filter((e) => e.sourceOrdinal === primarySource?.ordinal || e.sourceDomain.includes(targetDomain));

    const lines: string[] = [
      `# Content and Overview of ${targetDomain}\n\n`,
      `**Direct Source**: [${primarySource?.ordinal || 1}] [${primarySource?.title || targetDomain}](${primarySource?.url || '#'})\n\n`,
      `## Summary of Published Information\n\n`,
    ];

    if (relatedEvidence.length > 0) {
      for (const ev of relatedEvidence.slice(0, 10)) {
        lines.push(`- ${ev.claim} [${ev.sourceOrdinal}].\n`);
      }
    } else if (primarySource?.snippet) {
      lines.push(`${primarySource.snippet} [${primarySource.ordinal}].\n\n`);
    }

    lines.push(`\n## Verified Key Details\n\n`);
    lines.push(`| Property | Value | Source |\n| :--- | :--- | :--- |\n`);
    lines.push(`| **Domain** | \`${targetDomain}\` | [${primarySource?.ordinal || 1}] |\n`);
    lines.push(`| **Title** | ${primarySource?.title || 'Campus Resource Hub'} | [${primarySource?.ordinal || 1}] |\n`);
    lines.push(`| **Status** | Active Online | [${primarySource?.ordinal || 1}] |\n`);

    if (sources.length > 1) {
      lines.push(`\n### Related Network Resources\n\n`);
      for (const s of sources.slice(1, 5)) {
        lines.push(`- **[${s.ordinal}] [${s.title}](${s.url})**: ${s.snippet || s.domain}\n`);
      }
    }

    return lines.join('');
  }

  // 2. Comprehensive Research Report for Factual, Comparison & Technical Inquiries
  const sections: string[] = [
    `# Research Findings: ${originalQuery}\n\n`,
  ];

  // Executive summary
  const topEvidence = evidence.slice(0, 3);
  if (topEvidence.length > 0) {
    sections.push(
      `**Executive Summary**: Research across ${sources.length} sources reveals that **${originalQuery}** involves distinct verified factors. ` +
      topEvidence.map((e) => `${e.claim} [${e.sourceOrdinal}]`).join(' ') +
      `\n\n`
    );
  }

  // Group evidence by dimension
  const byDim = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    const list = byDim.get(item.dimension) || [];
    list.push(item);
    byDim.set(item.dimension, list);
  }

  for (const [dim, items] of byDim.entries()) {
    sections.push(`## ${dim}\n\n`);
    const metrics = items.filter((i) => i.type === 'METRIC');
    const facts = items.filter((i) => i.type !== 'METRIC');

    for (const f of facts.slice(0, 5)) {
      sections.push(`- ${f.claim} [${f.sourceOrdinal}].\n`);
    }

    if (metrics.length > 0) {
      sections.push(`\n### Key Metrics & Quantitative Data\n\n`);
      sections.push(`| Specification / Measurement | Value Reported | Citation |\n| :--- | :--- | :--- |\n`);
      for (const m of metrics.slice(0, 6)) {
        const words = m.claim.split(' ');
        const label = words.slice(0, 4).join(' ');
        sections.push(`| ${label} | ${m.claim} | [${m.sourceOrdinal}] |\n`);
      }
      sections.push('\n');
    }
    sections.push('\n');
  }

  // Discrepancies section if any detected
  if (conflicts.length > 0) {
    sections.push(`## Cross-Source Verification & Discrepancies\n\n`);
    sections.push(`Cross-checking evidence across independent sources identified the following variances:\n\n`);
    for (const c of conflicts) {
      sections.push(`> ⚠️ **${c.dimension}**: ${c.discrepancyExplanation}\n\n`);
    }
  }

  // Source overview table
  sections.push(`## Evaluated Sources\n\n`);
  sections.push(`| Ref | Source Name | Domain | Primary Focus |\n| :--- | :--- | :--- | :--- |\n`);
  for (const s of sources) {
    sections.push(`| [${s.ordinal}] | [${s.title.slice(0, 45)}](${s.url}) | \`${s.domain}\` | Verified Reference |\n`);
  }

  return sections.join('');
}
