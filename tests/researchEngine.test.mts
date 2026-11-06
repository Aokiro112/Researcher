import assert from 'node:assert';
import { test } from 'node:test';
import { analyzeQuery } from '../src/lib/research/queryAnalyzer.ts';
import { createResearchPlan } from '../src/lib/research/researchPlanner.ts';
import { extractEvidenceFromPassages } from '../src/lib/research/evidenceExtractor.ts';
import { detectConflictsAndVerify } from '../src/lib/research/claimVerifier.ts';
import { validateAndCleanCitations } from '../src/lib/research/citationValidator.ts';
import { generateDeterministicResearchReport } from '../src/lib/research/researchSynthesizer.ts';
import type { ExtractedPassage } from '../src/lib/research/types.ts';
import type { SourceItem } from '../src/lib/types/thread.ts';

test('QueryAnalyzer - detects URL extraction intent and domain', () => {
  const analysis = analyzeQuery('give me the content which is present in bithub.co.in');
  assert.strictEqual(analysis.intent, 'URL_EXTRACTION');
  assert.strictEqual(analysis.targetDomain, 'bithub.co.in');
  assert.strictEqual(analysis.targetUrl, 'https://bithub.co.in');
});

test('QueryAnalyzer - detects comparison intent and entities', () => {
  const analysis = analyzeQuery('Compare RTX 5070 vs RX 9070 for AI workloads');
  assert.strictEqual(analysis.intent, 'COMPARISON');
  assert.strictEqual(analysis.isComparison, true);
  assert.ok(analysis.entities.includes('RTX 5070'));
  assert.ok(analysis.entities.includes('RX 9070'));
});

test('QueryAnalyzer - keeps simple questions as NORMAL depth', () => {
  const analysis = analyzeQuery('What is Python?');
  assert.strictEqual(analysis.depth, 'NORMAL');
  assert.ok(analysis.complexityScore <= 4);
});

test('ResearchPlanner - generates multi-dimensional sub-queries', () => {
  const analysis = analyzeQuery('Compare RTX 5070 vs RX 9070 for AI development', 'deep_research');
  const plan = createResearchPlan(analysis);
  assert.ok(plan.dimensions.length >= 3);
  const allSubQueries = plan.dimensions.flatMap((d) => d.searchQueries);
  assert.ok(allSubQueries.length >= 6);
  assert.ok(allSubQueries.some((q) => q.includes('benchmark')));
});

test('EvidenceExtractor - categorizes metrics and facts accurately', () => {
  const mockPlan = createResearchPlan(analyzeQuery('Nvidia RTX 5070 specs'));
  const passages: ExtractedPassage[] = [
    {
      id: 'p1',
      sourceUrl: 'https://nvidia.com/rtx-5070',
      sourceOrdinal: 1,
      sourceTitle: 'RTX 5070 Specs',
      sourceDomain: 'nvidia.com',
      text: 'The RTX 5070 features 12 GB GDDR7 memory with 672 GB/s bandwidth and 250 W TDP. Some users feel this is the best value GPU.',
      relevanceScore: 8,
    },
  ];

  const evidence = extractEvidenceFromPassages(passages, mockPlan);
  assert.ok(evidence.length > 0);
  const metricEvidence = evidence.find((e) => e.type === 'METRIC');
  assert.ok(metricEvidence, 'Should extract metric evidence with numbers/units');
  assert.strictEqual(metricEvidence?.sourceOrdinal, 1);
});

test('ClaimVerifier - detects numerical discrepancies across sources', () => {
  const evidence = [
    {
      id: 'e1',
      claim: 'The launch price is $549 for the reference edition.',
      evidenceSnippet: 'The launch price is $549',
      sourceOrdinal: 1,
      sourceUrl: 'https://siteA.com',
      sourceDomain: 'siteA.com',
      confidence: 0.9,
      relevance: 0.9,
      type: 'METRIC' as const,
      dimension: 'Pricing & Availability',
    },
    {
      id: 'e2',
      claim: 'Retailers are listing the starting price at $649 due to tariff surcharges.',
      evidenceSnippet: 'starting price at $649',
      sourceOrdinal: 2,
      sourceUrl: 'https://siteB.com',
      sourceDomain: 'siteB.com',
      confidence: 0.85,
      relevance: 0.9,
      type: 'METRIC' as const,
      dimension: 'Pricing & Availability',
    },
  ];

  const { conflicts } = detectConflictsAndVerify(evidence);
  assert.strictEqual(conflicts.length, 1);
  assert.ok(conflicts[0].discrepancyExplanation.includes('siteA.com'));
  assert.ok(conflicts[0].discrepancyExplanation.includes('siteB.com'));
});

test('CitationValidator - cleans hallucinated citations and grounds sources', () => {
  const rawMarkdown = 'RTX 5070 has 12GB VRAM [1] and 672 GB/s bandwidth [2]. Unverified claim [99].';
  const sources: SourceItem[] = [
    { title: 'Source 1', url: 'https://s1.com', domain: 's1.com', ordinal: 1 },
    { title: 'Source 2', url: 'https://s2.com', domain: 's2.com', ordinal: 2 },
  ];

  const { cleanedMarkdown, verifiedCitations } = validateAndCleanCitations(rawMarkdown, sources, []);
  assert.ok(!cleanedMarkdown.includes('[99]'), 'Should sanitize invalid citation [99]');
  assert.ok(cleanedMarkdown.includes('[1]'));
  assert.ok(cleanedMarkdown.includes('[2]'));
  assert.strictEqual(verifiedCitations.length, 2);
});

test('ResearchSynthesizer - produces rich structured report with tables and citations', () => {
  const analysis = analyzeQuery('Compare RTX 5070 vs RX 9070 for AI development');
  const plan = createResearchPlan(analysis);
  const sources: SourceItem[] = [
    { title: 'Nvidia RTX 5070', url: 'https://nvidia.com', domain: 'nvidia.com', ordinal: 1 },
    { title: 'AMD RX 9070', url: 'https://amd.com', domain: 'amd.com', ordinal: 2 },
  ];
  const evidence = [
    {
      id: 'e1',
      claim: 'RTX 5070 delivers 144 TFLOPS of FP16 compute.',
      evidenceSnippet: '144 TFLOPS FP16 compute',
      sourceOrdinal: 1,
      sourceUrl: 'https://nvidia.com',
      sourceDomain: 'nvidia.com',
      confidence: 0.9,
      relevance: 0.9,
      type: 'METRIC' as const,
      dimension: 'Compute & Architecture',
    },
  ];

  const report = generateDeterministicResearchReport(analysis, plan, sources, evidence, []);
  assert.ok(report.includes('# Research Findings:'));
  assert.ok(report.includes('[1]'));
  assert.ok(report.includes('| Specification / Measurement | Value Reported | Citation |'));
  assert.ok(report.includes('## Evaluated Sources'));
});
