'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Edit2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ThreadEntry, SourceItem } from '@/lib/types/thread';
import { SourcesDrawer } from './SourcesDrawer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { QueryComposer } from '../composer/QueryComposer';

interface AnswerViewProps {
  entry: ThreadEntry;
  onFollowUp: (query: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
}

export function AnswerView({ entry, onFollowUp, isStreaming, onStop }: AnswerViewProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'links' | 'images'>('answer');
  const [copied, setCopied] = useState(false);

  const copyAnswer = () => {
    if (entry.responseText) {
      navigator.clipboard.writeText(entry.responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to render markdown-like structures into clean accessible HTML
  const renderFormattedText = (rawText: string, sources: SourceItem[]) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return null;
      const headers = tableRows[0];
      const rows = tableRows.slice(2); // Skip separator line

      const tableEl = (
        <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-subtle text-foreground uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="p-2.5">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-subtle/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-secondary">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
      return tableEl;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        elements.push(flushTable(idx));
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-xl sm:text-2xl font-bold text-foreground mt-4 mb-2 tracking-tight">
            {trimmed.slice(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg sm:text-xl font-semibold text-foreground mt-4 mb-2 tracking-tight">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm sm:text-base font-semibold text-foreground mt-3 mb-1">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Bullet list
        elements.push(
          <li key={idx} className="ml-4 list-disc text-sm text-foreground/90 leading-relaxed my-0.5">
            {parseCitations(trimmed.slice(2), sources)}
          </li>
        );
      } else if (trimmed.length > 0) {
        // Paragraph
        elements.push(
          <p key={idx} className="text-sm text-foreground/90 leading-relaxed my-2">
            {parseCitations(trimmed, sources)}
          </p>
        );
      }
    });

    if (inTable) {
      elements.push(flushTable(lines.length));
    }

    return elements;
  };

  // Helper to replace [1], [2] with clickable interactive citation pills
  const parseCitations = (text: string, sources: SourceItem[]): React.ReactNode => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const ordinal = parseInt(match[1], 10);
        const source = sources.find((s) => s.ordinal === ordinal);
        return (
          <sup key={i} className="inline-block mx-0.5">
            <a
              href={source ? source.url : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-subtle hover:bg-accent hover:text-white border border-border text-[10px] font-mono font-medium text-secondary transition-colors"
              title={source ? `${source.title} (${source.domain})` : `Source [${ordinal}]`}
            >
              {ordinal}
            </a>
          </sup>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-threadWidth mx-auto py-4 px-4 sm:px-6">
      {/* Top Navigation & Tabs Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 gap-2 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-foreground p-1.5 rounded-lg hover:bg-soft transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Answer Mode Tabs */}
        <div className="flex items-center bg-subtle p-0.5 rounded-lg border border-border/60" role="tablist">
          {(['answer', 'links', 'images'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-secondary hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Share Button */}
        <button
          onClick={copyAnswer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-soft border border-border text-xs text-secondary hover:text-foreground transition-colors"
          title="Share answer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Query Header */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between text-xs text-muted mb-1">
          <span>{entry.createdAt || 'Just now'}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAnswer}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
              title="Copy query"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {entry.queryText}
        </h1>
      </div>

      {/* Discovered Sources Grid */}
      <SourcesDrawer sources={entry.sources} />

      {/* Thinking / Streaming Indicator */}
      <ThinkingIndicator status={entry.status} sourcesCount={entry.sources.length} />

      {/* Execution Time Badge */}
      {entry.status === 'COMPLETED' && (
        <div className="flex items-center gap-1.5 my-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-subtle text-muted text-[11px] font-medium border border-border">
            <Clock className="w-3 h-3 text-accent" />
            <span>Finished in {entry.timeTakenMs || 3}s</span>
          </span>
        </div>
      )}

      {/* Answer Tab Content */}
      {activeTab === 'answer' && (
        <div className="prose prose-neutral dark:prose-invert max-w-none my-4">
          {renderFormattedText(entry.responseText, entry.sources)}
        </div>
      )}

      {/* Links Tab Content */}
      {activeTab === 'links' && (
        <div className="space-y-2 my-4">
          {entry.sources.map((s) => (
            <a
              key={s.ordinal}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between p-3 rounded-xl bg-card border border-border hover:border-accent/60 transition-all text-xs"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{s.title}</p>
                <p className="text-muted text-xs mt-0.5">{s.url}</p>
                {s.snippet && <p className="text-secondary mt-1 line-clamp-2">{s.snippet}</p>}
              </div>
              <ExternalLink className="w-4 h-4 text-muted shrink-0 ml-2" />
            </a>
          ))}
        </div>
      )}

      {/* Images Tab Content */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="aspect-video bg-subtle rounded-xl flex items-center justify-center text-xs text-muted border border-border">
            No media attachments found
          </div>
        </div>
      )}

      {/* Follow-up Composer */}
      <div className="mt-8 pt-4 border-t border-border">
        <QueryComposer
          placeholder="Ask a follow-up…"
          isStreaming={isStreaming}
          onStop={onStop}
          onSubmit={onFollowUp}
        />
      </div>
    </div>
  );
}
