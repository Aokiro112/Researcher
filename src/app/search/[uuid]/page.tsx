'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ThreadEntry, SourceItem } from '@/lib/types/thread';
import { startSearchStream } from '@/lib/stream/streamClient';
import { AnswerView } from '@/components/search/AnswerView';
import { saveThread } from '@/lib/store';

export default function SearchThreadPage() {
  const params = useParams();
  const threadId = (params?.uuid as string) || 'default-session';

  const [entry, setEntry] = useState<ThreadEntry>({
    id: threadId,
    queryText: 'What is quantum computing?',
    status: 'SEARCHING',
    responseText: '',
    sources: [],
    steps: [],
    modelUsed: 'gemini-3.8-flash',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check if query was set in sessionStorage
    let initialQuery = 'What is quantum computing?';
    let initialMode = 'search';
    let initialModel = 'gemini-3.8-flash';

    try {
      const stored = sessionStorage.getItem(`pending_query_${threadId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.query) initialQuery = parsed.query;
        if (parsed.mode) initialMode = parsed.mode;
        if (parsed.model) initialModel = parsed.model;
        sessionStorage.removeItem(`pending_query_${threadId}`);
      }
    } catch {}

    setEntry((prev) => ({
      ...prev,
      queryText: initialQuery,
      modelUsed: initialModel,
    }));

    // Start live SSE search stream
    setIsStreaming(true);
    const { abort } = startSearchStream(initialQuery, initialMode, initialModel, {
      onUpdate: (updatedState) => {
        setEntry((prev) => ({
          ...prev,
          ...updatedState,
        }));
      },
      onComplete: (finalState) => {
        setIsStreaming(false);
        setEntry((prev) => {
          const completed = {
            ...prev,
            ...finalState,
            status: 'COMPLETED' as const,
          };
          saveThread({
            id: threadId,
            slug: threadId,
            title: prev.queryText,
            isIncognito: false,
            mode: 'search',
            createdAt: prev.createdAt || 'Just now',
            updatedAt: new Date().toISOString(),
            entries: { [threadId]: completed },
          });
          return completed;
        });
      },
      onError: (err) => {
        setIsStreaming(false);
        setEntry((prev) => ({
          ...prev,
          status: 'FAILED',
          responseText: `Error streaming answer: ${err.message}`,
        }));
      },
    });

    streamAbortRef.current = abort;

    return () => {
      if (streamAbortRef.current) {
        streamAbortRef.current();
      }
    };
  }, [threadId]);

  const handleStop = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current();
      setIsStreaming(false);
      setEntry((prev) => ({ ...prev, status: 'COMPLETED' }));
    }
  };

  const handleFollowUp = (followUpQuery: string) => {
    // Append follow-up turn
    setIsStreaming(true);
    setEntry((prev) => ({
      ...prev,
      queryText: followUpQuery,
      status: 'SEARCHING',
      responseText: '',
      sources: [],
      steps: [],
    }));

    const { abort } = startSearchStream(followUpQuery, 'search', entry.modelUsed, {
      onUpdate: (updatedState) => {
        setEntry((prev) => ({ ...prev, ...updatedState }));
      },
      onComplete: (finalState) => {
        setIsStreaming(false);
        setEntry((prev) => ({ ...prev, ...finalState, status: 'COMPLETED' }));
      },
      onError: (err) => {
        setIsStreaming(false);
        setEntry((prev) => ({
          ...prev,
          status: 'FAILED',
          responseText: `Error: ${err.message}`,
        }));
      },
    });

    streamAbortRef.current = abort;
  };

  return (
    <AnswerView
      entry={entry}
      onFollowUp={handleFollowUp}
      isStreaming={isStreaming}
      onStop={handleStop}
    />
  );
}
