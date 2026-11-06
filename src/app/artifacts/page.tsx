'use client';

import React from 'react';
import { FileCode2, Sparkles, Plus } from 'lucide-react';

export default function ArtifactsPage() {
  return (
    <div className="flex-1 p-4 sm:p-8 max-w-threadWidth mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Artifacts
        </h1>
        <p className="text-sm text-secondary">
          Interactive widgets, code prototypes, and polished documents created by Computer.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-4 my-8">
        <div className="p-3 rounded-2xl bg-accent/10 text-accent">
          <FileCode2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground">No artifacts yet</h3>
          <p className="text-xs text-muted max-w-sm">
            Ask Computer to generate interactive web applications, charts, or comprehensive reports.
          </p>
        </div>
      </div>
    </div>
  );
}
