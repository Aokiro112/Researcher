'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Search,
  BookOpen,
  GraduationCap,
  Users2,
  Cpu,
  X,
  FileText,
} from 'lucide-react';
import { SearchMode } from '@/lib/types/thread';
import { ModelPicker } from './ModelPicker';
import { AttachmentMenu } from './AttachmentMenu';

interface QueryComposerProps {
  initialQuery?: string;
  placeholder?: string;
  isStreaming?: boolean;
  onStop?: () => void;
  onSubmit: (query: string, mode: SearchMode, model: string, attachments: File[]) => void;
  defaultMode?: SearchMode;
  defaultModel?: string;
}

export function QueryComposer({
  initialQuery = '',
  placeholder = 'Ask anything…',
  isStreaming = false,
  onStop,
  onSubmit,
  defaultMode = 'search',
  defaultModel = 'gemini-3.8-flash',
}: QueryComposerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const [model, setModel] = useState<string>(defaultModel);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [query]);

  // Esc key stops generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming && onStop) {
        onStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, onStop]);

  // Autosuggest fetching
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length > 2 && !isStreaming) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch('/api/rest/autosuggest/list-autosuggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: trimmed }),
          });
          if (res.ok) {
            const data = await res.json();
            setSuggestions((data.suggestions || []).map((s: any) => s.text).slice(0, 4));
          }
        } catch {}
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query, isStreaming]);

  // Web Speech API for voice dictation
  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isStreaming) return;
    setSuggestions([]);
    onSubmit(trimmed, mode, model, attachments);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const modes: { id: SearchMode; label: string; icon: any }[] = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'deep_research', label: 'Deep Research', icon: BookOpen },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'model_council', label: 'Model Council', icon: Users2 },
    { id: 'computer', label: 'Computer', icon: Cpu },
  ];

  return (
    <div className="relative w-full max-w-threadWidth mx-auto">
      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 bottom-full mb-2 w-full bg-card rounded-xl border border-border shadow-lg p-1.5 z-40 divide-y divide-border/40">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sug);
                setSuggestions([]);
                onSubmit(sug, mode, model, attachments);
              }}
              className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-subtle rounded-lg flex items-center justify-between"
            >
              <span>{sug}</span>
              <ArrowRight className="w-3 h-3 text-muted" />
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-card border border-border rounded-2xl shadow-sm hover:border-accent/40 focus-within:border-accent/70 transition-all p-3 space-y-2">
        {/* Attachment Pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1 pb-1">
            {attachments.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-subtle text-foreground text-xs border border-border"
              >
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent resize-none outline-none text-foreground text-base placeholder:text-muted px-1 pt-1 leading-relaxed max-h-[220px]"
          aria-label={placeholder}
        />

        {/* Bottom Toolbar Controls */}
        <div className="flex items-center justify-between pt-1 gap-2 border-t border-border/40">
          {/* Left Toolbar */}
          <div className="flex items-center gap-1 flex-wrap">
            <AttachmentMenu
              onAttachFile={(f) => setAttachments((prev) => [...prev, f])}
              onOpenCloudPicker={() => alert('Cloud Picker: Google Drive, Dropbox')}
              onOpenPluginPicker={() => alert('Plugins: Model Context Protocol (MCP)')}
            />

            {/* Mode Selector Buttons */}
            <div className="flex items-center bg-subtle/80 p-0.5 rounded-lg border border-border/60">
              {modes.slice(0, 3).map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Model Picker */}
            <ModelPicker selectedModel={model} onSelectModel={setModel} />
          </div>

          {/* Right Toolbar: Voice & Submit / Stop */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleDictation}
              className={`p-2 rounded-lg text-secondary hover:text-foreground hover:bg-soft transition-colors ${
                isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : ''
              }`}
              title={isListening ? 'Stop recording' : 'Dictation'}
              aria-label="Dictation"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Stop response (Esc)"
                aria-label="Stop response (Esc)"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim()}
                className="p-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-xs"
                title="Submit query"
                aria-label="Submit query"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
