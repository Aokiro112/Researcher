'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [tab, setTab] = useState<'personal' | 'education' | 'business'>('personal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-subtle transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Select your plan
          </h2>
          <p className="text-sm text-secondary">
            Upgrade for a broader search experience and premium AI models.
          </p>

          {/* Radiogroup Tabs */}
          <div className="inline-flex bg-subtle p-1 rounded-xl border border-border/60 mx-auto mt-2" role="radiogroup">
            {(['personal', 'education', 'business'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  tab === t ? 'bg-card text-foreground shadow-2xs' : 'text-secondary hover:text-foreground'
                }`}
                role="radio"
                aria-checked={tab === t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Free Tier */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-border bg-subtle/30 space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base text-foreground">Free</h3>
                <p className="text-xs text-muted">Answers with accurate AI and citations</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">$0</span>
                <span className="text-xs text-muted">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Good for limited daily usage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Better for simple questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Citations in every answer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Access to basic AI models</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl border border-border bg-card hover:bg-soft text-foreground text-xs font-semibold transition-colors"
            >
              Continue with free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="relative flex flex-col justify-between p-5 rounded-2xl border-2 border-accent bg-card shadow-lg space-y-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              Popular
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-foreground">Perplexity Pro</h3>
                </div>
                <p className="text-xs text-muted">Advanced answers and top AI models</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">$17</span>
                <span className="text-xs text-muted">/month billed annually</span>
              </div>
              <p className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md inline-block">
                +$40 free Computer credits LIMITED TIME
              </p>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Expanded Computer access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>4,000 bonus credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Deep research multi-hop</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Access to top AI models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Select between leading AI models</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Proceed to Stripe Checkout ($17/mo)')}
              className="w-full py-2 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Get Pro
            </button>
          </div>

          {/* Max Tier */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-border bg-subtle/30 space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base text-foreground">Perplexity Max</h3>
                <p className="text-xs text-muted">Unlimited usage and frontier models</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">$167</span>
                <span className="text-xs text-muted">/month billed annually</span>
              </div>
              <p className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                +$450 free Computer credits
              </p>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Maximum Computer usage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>35,000 bonus credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Model Council consensus access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Frontier AI models (Claude Opus 5.5, GPT-6 Astra)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Priority access to new features</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Proceed to Stripe Checkout ($167/mo)')}
              className="w-full py-2 px-4 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold transition-colors shadow-xs"
            >
              Get Max
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
