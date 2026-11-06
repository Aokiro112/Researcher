'use client';

import React from 'react';
import { Sparkles, Globe, BrainCircuit } from 'lucide-react';
import { EntryStatus } from '@/lib/types/thread';

interface ThinkingIndicatorProps {
  status: EntryStatus;
  sourcesCount: number;
}

export function ThinkingIndicator({ status, sourcesCount }: ThinkingIndicatorProps) {
  if (status === 'COMPLETED' || status === 'FAILED') return null;

  let message = 'Searching web sources…';
  let Icon = Globe;

  if (sourcesCount > 0) {
    message = `Reading ${sourcesCount} sources…`;
    Icon = BrainCircuit;
  }

  if (status === 'STREAMING') {
    message = 'Synthesizing verified answer…';
    Icon = Sparkles;
  }

  return (
    <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-subtle/80 border border-border/60 text-secondary text-xs my-2 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-accent/30 animate-ping absolute" />
        <Icon className="w-4 h-4 text-accent relative z-10 animate-pulse" />
      </div>
      <span className="font-medium text-foreground tracking-tight">{message}</span>
    </div>
  );
}
