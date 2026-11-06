import { SourceItem, ExecutionStep } from '../types/thread';
import { analyzeQuery } from './queryAnalyzer';
import { createResearchPlan } from './researchPlanner';
import { orchestrateSearch } from './searchOrchestrator';
import { extractPassagesFromSources } from './contentExtractor';
import { extractEvidenceFromPassages } from './evidenceExtractor';
import { detectConflictsAndVerify } from './claimVerifier';
import { buildSynthesisPrompt, generateDeterministicResearchReport } from './researchSynthesizer';
import { validateAndCleanCitations } from './citationValidator';
import { streamSynthesis } from '../llm/llmRouter';
import { ResearchResult } from './types';

export interface ResearchEngineOptions {
  query: string;
  mode: string;
  model: string;
  onStepUpdate: (step: ExecutionStep, replaceIndex?: number) => void;
  onSourcesFound: (sources: SourceItem[]) => void;
  onTokenChunk: (text: string) => void;
  signal?: AbortSignal;
}

export async function executeResearchPipeline(
  options: ResearchEngineOptions
): Promise<ResearchResult> {
  const { query, mode, model, onStepUpdate, onSourcesFound, onTokenChunk, signal } = options;
  const startTime = Date.now();

  // STEP 1: Query Analysis
  onStepUpdate({
    stepType: 'QUERY_ANALYSIS',
    status: 'RUNNING',
    content: { message: 'Analyzing query intent and complexity...' },
  });

  const analysis = analyzeQuery(query, mode);

  onStepUpdate({
    stepType: 'QUERY_ANALYSIS',
    status: 'COMPLETED',
    content: {
      intent: analysis.intent,
      depth: analysis.depth,
      complexityScore: analysis.complexityScore,
      targetDomain: analysis.targetDomain,
      entities: analysis.entities,
    },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 2: Research Planning & Dimension Decomposition
  onStepUpdate({
    stepType: 'RESEARCH_PLAN',
    status: 'RUNNING',
    content: { message: 'Decomposing inquiry into research dimensions...' },
  });

  const plan = createResearchPlan(analysis);

  onStepUpdate({
    stepType: 'RESEARCH_PLAN',
    status: 'COMPLETED',
    content: {
      dimensionsCount: plan.dimensions.length,
      dimensions: plan.dimensions.map((d) => d.name),
      subQueriesCount: plan.dimensions.flatMap((d) => d.searchQueries).length,
    },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 3: Multi-Query Search & Source Orchestration
  onStepUpdate({
    stepType: 'MULTI_QUERY',
    status: 'RUNNING',
    content: {
      message: `Searching across ${plan.dimensions.length} dimensions in parallel...`,
      subQueries: plan.dimensions.flatMap((d) => d.searchQueries),
    },
  });

  const sources = await orchestrateSearch(plan, (msg, count) => {
    onStepUpdate({
      stepType: 'MULTI_QUERY',
      status: 'RUNNING',
      content: { message: msg, sourcesFound: count },
    });
  });

  onSourcesFound(sources);

  onStepUpdate({
    stepType: 'MULTI_QUERY',
    status: 'COMPLETED',
    content: {
      sourcesRetrieved: sources.length,
      domains: Array.from(new Set(sources.map((s) => s.domain))),
    },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 4: Content Extraction & Passage Scoring
  onStepUpdate({
    stepType: 'CONTENT_EXTRACTION',
    status: 'RUNNING',
    content: { message: `Reading and extracting evidence from ${sources.length} sources...` },
  });

  const passages = await extractPassagesFromSources(sources, plan, (scraped, total) => {
    onStepUpdate({
      stepType: 'CONTENT_EXTRACTION',
      status: 'RUNNING',
      content: { message: `Scraped and parsed ${scraped}/${total} sources` },
    });
  });

  onStepUpdate({
    stepType: 'CONTENT_EXTRACTION',
    status: 'COMPLETED',
    content: { passagesExtracted: passages.length },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 5: Evidence Extraction & Claim Classification
  onStepUpdate({
    stepType: 'EVIDENCE_EXTRACTION',
    status: 'RUNNING',
    content: { message: 'Extracting factual claims, metrics, and quantitative data...' },
  });

  const rawEvidence = extractEvidenceFromPassages(passages, plan);

  onStepUpdate({
    stepType: 'EVIDENCE_EXTRACTION',
    status: 'COMPLETED',
    content: {
      evidenceCount: rawEvidence.length,
      metricsCount: rawEvidence.filter((e) => e.type === 'METRIC').length,
    },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 6: Claim Verification & Contradiction Detection
  onStepUpdate({
    stepType: 'CLAIM_VERIFICATION',
    status: 'RUNNING',
    content: { message: 'Cross-verifying claims and checking for conflicting data...' },
  });

  const { conflicts, verifiedEvidence } = detectConflictsAndVerify(rawEvidence);

  onStepUpdate({
    stepType: 'CLAIM_VERIFICATION',
    status: 'COMPLETED',
    content: {
      conflictsDetected: conflicts.length,
      verifiedClaimsCount: verifiedEvidence.length,
    },
  });

  if (signal?.aborted) throw new Error('Research aborted');

  // STEP 7: Research Synthesis & Final Streaming
  onStepUpdate({
    stepType: 'SYNTHESIS',
    status: 'RUNNING',
    content: { message: 'Synthesizing comprehensive research report...' },
  });

  const { systemInstruction, userPrompt } = buildSynthesisPrompt(
    analysis,
    plan,
    sources,
    verifiedEvidence,
    conflicts
  );

  const fallbackMarkdown = generateDeterministicResearchReport(
    analysis,
    plan,
    sources,
    verifiedEvidence,
    conflicts
  );

  const tokenGenerator = streamSynthesis({
    model,
    query,
    sources,
    mode,
    systemPrompt: systemInstruction,
    userPrompt,
    fallbackText: fallbackMarkdown,
  });

  let rawGeneratedText = '';
  for await (const token of tokenGenerator) {
    if (signal?.aborted) break;
    rawGeneratedText += token;
    onTokenChunk(rawGeneratedText);
  }

  // STEP 8: Citation Validation & Post-processing
  onStepUpdate({
    stepType: 'CITATION_VALIDATION',
    status: 'RUNNING',
    content: { message: 'Validating citations and verifying evidence grounding...' },
  });

  const { cleanedMarkdown, verifiedCitations } = validateAndCleanCitations(
    rawGeneratedText || fallbackMarkdown,
    sources,
    verifiedEvidence
  );

  onTokenChunk(cleanedMarkdown);

  onStepUpdate({
    stepType: 'CITATION_VALIDATION',
    status: 'COMPLETED',
    content: {
      verifiedCitationsCount: verifiedCitations.length,
    },
  });

  onStepUpdate({
    stepType: 'SYNTHESIS',
    status: 'COMPLETED',
  });

  const timeTakenMs = Date.now() - startTime;

  return {
    analysis,
    plan,
    sources,
    evidence: verifiedEvidence,
    conflicts,
    verifiedCitations,
    synthesizedMarkdown: cleanedMarkdown,
    timeTakenMs,
  };
}
