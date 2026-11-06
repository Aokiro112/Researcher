'use client';

import React, { useState } from 'react';
import { SourceItem } from '@/lib/types/thread';
import { ExternalLink, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcesDrawerProps {
  sources: SourceItem[];
}

export function SourcesDrawer({ sources }: SourcesDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-accent transition-colors"
        >
          <span>Sources {sources.length}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {sources.map((s) => (
            <a
              key={s.ordinal}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between p-2.5 rounded-xl bg-card border border-border/80 hover:border-accent/60 hover:bg-soft/50 transition-all text-xs group"
            >
              <div>
                <p className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {s.title}
                </p>
                {s.snippet && (
                  <p className="text-[10px] text-muted line-clamp-1 mt-1">{s.snippet}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/30 text-[10px] text-muted">
                <span className="flex items-center gap-1 truncate max-w-[100px]">
                  {s.isTrusted && <ShieldCheck className="w-3 h-3 text-accent shrink-0" />}
                  {s.domain}
                </span>
                <span className="font-mono font-medium text-secondary bg-subtle px-1 rounded shrink-0">
                  {s.ordinal}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
