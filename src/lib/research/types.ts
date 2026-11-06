import { SourceItem, ExecutionStep, StepType, StepStatus } from '../types/thread';

export type ResearchDepth = 'NORMAL' | 'RESEARCH' | 'DEEP_RESEARCH';

export type QueryIntent =
  | 'FACTUAL'
  | 'COMPARISON'
  | 'EXPLORATORY'
  | 'URL_EXTRACTION'
  | 'CURRENT_EVENT'
  | 'TECHNICAL';

export interface QueryAnalysis {
  originalQuery: string;
  cleanQuery: string;
  intent: QueryIntent;
  depth: ResearchDepth;
  isFreshnessRequired: boolean;
  isComparison: boolean;
  targetUrl?: string;
  targetDomain?: string;
  entities: string[];
  dimensions: string[];
  complexityScore: number; // 1 to 10
}

export interface ResearchDimension {
  id: string;
  name: string;
  description: string;
  searchQueries: string[];
  priority: number;
}

export interface ResearchPlan {
  queryAnalysis: QueryAnalysis;
  dimensions: ResearchDimension[];
  maxSourcesToFetch: number;
  maxPassagesToExtract: number;
}

export interface ExtractedPassage {
  id: string;
  sourceUrl: string;
  sourceOrdinal: number;
  sourceTitle: string;
  sourceDomain: string;
  heading?: string;
  text: string;
  relevanceScore: number;
  containsTable?: boolean;
}

export type EvidenceType = 'FACT' | 'METRIC' | 'OPINION' | 'UNCERTAIN';

export interface EvidenceItem {
  id: string;
  claim: string;
  evidenceSnippet: string;
  sourceOrdinal: number;
  sourceUrl: string;
  sourceDomain: string;
  confidence: number; // 0 to 1
  relevance: number; // 0 to 1
  type: EvidenceType;
  dimension: string;
}

export interface ClaimConflict {
  dimension: string;
  claimA: string;
  sourceAOrdinal: number;
  sourceADomain: string;
  claimB: string;
  sourceBOrdinal: number;
  sourceBDomain: string;
  discrepancyExplanation: string;
}

export interface VerifiedCitation {
  ordinal: number;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  supportingEvidenceCount: number;
}

export interface ResearchProgressEvent {
  stepType: StepType;
  status: StepStatus;
  label: string;
  details?: Record<string, unknown>;
}

export interface ResearchResult {
  analysis: QueryAnalysis;
  plan: ResearchPlan;
  sources: SourceItem[];
  evidence: EvidenceItem[];
  conflicts: ClaimConflict[];
  verifiedCitations: VerifiedCitation[];
  synthesizedMarkdown: string;
  timeTakenMs: number;
}
