export type SearchMode =
  | 'search'
  | 'deep_research'
  | 'learn'
  | 'model_council'
  | 'computer';

export interface SourceItem {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  isTrusted?: boolean;
  ordinal: number;
}

export type StepType =
  | 'INITIAL_QUERY'
  | 'WEB_SEARCH'
  | 'MULTI_QUERY'
  | 'PARALLEL_RETRIEVAL'
  | 'REASONING'
  | 'SYNTHESIS'
  | 'TOOL_CALL';

export type StepStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ExecutionStep {
  stepType: StepType;
  status: StepStatus;
  content?: Record<string, unknown>;
}

export type EntryStatus = 'PENDING' | 'SEARCHING' | 'STREAMING' | 'COMPLETED' | 'FAILED';

export interface ThreadEntry {
  id: string; // UUID
  backendUuid?: string;
  queryText: string;
  status: EntryStatus;
  responseText: string;
  modelUsed: string;
  sources: SourceItem[];
  steps: ExecutionStep[];
  timeTakenMs?: number;
  reconnectable?: boolean;
  createdAt?: string;
}

export interface Thread {
  id: string; // UUID
  slug: string;
  title: string;
  isIncognito: boolean;
  mode: SearchMode;
  createdAt: string;
  updatedAt: string;
  entries: Record<string, ThreadEntry>;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  badge?: 'Default' | 'New' | 'Max' | 'Internal' | 'Fast' | 'Ultra-Fast' | 'Reasoning';
  tierRequired: 'free' | 'pro' | 'max';
  description: string;
  isReasoning?: boolean;
}
