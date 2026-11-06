'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, BrainCircuit, CheckCircle2, ChevronDown, ChevronRight, Search, FileText, Scale, ShieldCheck } from 'lucide-react';
import { EntryStatus, ExecutionStep, StepType } from '@/lib/types/thread';

interface ThinkingIndicatorProps {
  status: EntryStatus;
  sourcesCount: number;
  steps?: ExecutionStep[];
}

function getStepIcon(type: StepType) {
  switch (type) {
    case 'QUERY_ANALYSIS':
    case 'RESEARCH_PLAN':
      return BrainCircuit;
    case 'WEB_SEARCH':
    case 'MULTI_QUERY':
    case 'PARALLEL_RETRIEVAL':
      return Search;
    case 'CONTENT_EXTRACTION':
    case 'EVIDENCE_EXTRACTION':
      return FileText;
    case 'CLAIM_VERIFICATION':
      return Scale;
    case 'CITATION_VALIDATION':
      return ShieldCheck;
    case 'SYNTHESIS':
    default:
      return Sparkles;
  }
}

function getStepLabel(step: ExecutionStep): string {
  if (step.content?.message && typeof step.content.message === 'string') {
    return step.content.message;
  }
  switch (step.stepType) {
    case 'QUERY_ANALYSIS':
      return 'Analyzing inquiry intent & research depth';
    case 'RESEARCH_PLAN':
      return 'Planning orthogonal research dimensions';
    case 'MULTI_QUERY':
    case 'PARALLEL_RETRIEVAL':
      return 'Searching multi-source web indices in parallel';
    case 'CONTENT_EXTRACTION':
      return 'Reading and extracting relevant passages';
    case 'EVIDENCE_EXTRACTION':
      return 'Extracting verifiable facts, metrics & claims';
    case 'CLAIM_VERIFICATION':
      return 'Cross-checking evidence & detecting discrepancies';
    case 'CITATION_VALIDATION':
      return 'Validating citations against ground truth';
    case 'SYNTHESIS':
      return 'Synthesizing verified research report';
    default:
      return 'Researching…';
  }
}

export function ThinkingIndicator({ status, sourcesCount, steps = [] }: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (status === 'COMPLETED' || status === 'FAILED') {
    // When completed, show an optional collapsed collapsible log if steps exist
    if (steps.length === 0) return null;
    return (
      <div className="my-2 border border-border/50 rounded-xl bg-subtle/40 overflow-hidden text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2.5 text-secondary hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-foreground">Research Pipeline Completed ({steps.length} steps)</span>
          </div>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-muted" />}
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-1.5 border-t border-border/30 pt-2 font-mono text-[11px] text-secondary">
            {steps.map((st, i) => {
              const Icon = getStepIcon(st.stepType);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <Icon className="w-3 h-3 text-muted" />
                  <span className="text-foreground/90">{getStepLabel(st)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Active Running State
  const activeStep = steps.find((s) => s.status === 'RUNNING') || steps[steps.length - 1];
  const activeLabel = activeStep ? getStepLabel(activeStep) : 'Analyzing inquiry and gathering evidence…';

  return (
    <div className="border border-border/70 rounded-xl bg-subtle/80 overflow-hidden my-2 text-xs shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-accent/30 animate-ping absolute" />
            <Sparkles className="w-4 h-4 text-accent relative z-10 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-foreground tracking-tight">{activeLabel}</p>
            {sourcesCount > 0 && (
              <p className="text-[11px] text-secondary mt-0.5">
                {sourcesCount} sources consulted • Verified research mode
              </p>
            )}
          </div>
        </div>

        {steps.length > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-muted hover:text-foreground rounded transition-colors"
            title="Toggle research steps"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isExpanded && steps.length > 1 && (
        <div className="px-4 pb-3 border-t border-border/40 pt-2 space-y-1.5">
          {steps.map((st, idx) => {
            const isCompleted = st.status === 'COMPLETED';
            const isCurrent = st.status === 'RUNNING';
            const Icon = getStepIcon(st.stepType);

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 text-[11px] ${
                  isCurrent ? 'text-accent font-medium' : isCompleted ? 'text-secondary' : 'text-muted'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <span className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-border shrink-0" />
                )}
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{getStepLabel(st)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
