'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Info } from 'lucide-react';
import { ModelOption } from '@/lib/types/thread';
import { AVAILABLE_MODELS } from '@/lib/types/models';

interface ModelPickerProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onRequireUpgrade?: (tier: string) => void;
}

export function ModelPicker({ selectedModel, onSelectModel, onRequireUpgrade }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (model: ModelOption) => {
    if (model.tierRequired === 'max' || model.tierRequired === 'pro') {
      // Check if user is on free tier
      // For open-source build, we allow selection while showing the badge!
    }
    onSelectModel(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-foreground hover:bg-soft transition-colors border border-transparent hover:border-border"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[120px]">{activeModel.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden divide-y divide-border/60 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-2.5 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted px-2">
              Access the top AI models
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = m.id === activeModel.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full text-left flex items-start justify-between p-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-soft text-foreground font-medium'
                      : 'text-secondary hover:text-foreground hover:bg-subtle'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {m.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            m.badge === 'Max'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : m.badge === 'New'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-subtle text-muted border border-border'
                          }`}
                        >
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted line-clamp-1">{m.description}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Footer Notice */}
          <div className="p-2.5 bg-subtle/50 flex items-center gap-1.5 text-[11px] text-muted">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>All models are hosted with secure inference</span>
          </div>
        </div>
      )}
    </div>
  );
}
