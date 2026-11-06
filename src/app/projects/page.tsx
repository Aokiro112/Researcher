'use client';

import React, { useState } from 'react';
import { FolderOpen, Plus, Search } from 'lucide-react';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-threadWidth mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-secondary">
            Set custom instructions, organize knowledge sources, and collaborate on shared threads.
          </p>
        </div>

        <button
          onClick={() => alert('Create project modal')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create project</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-4 my-8">
        <div className="p-3 rounded-2xl bg-subtle text-muted">
          <FolderOpen className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground">No projects</h3>
          <p className="text-xs text-muted max-w-sm">
            Create a project to attach research files and set context for your searches.
          </p>
        </div>
      </div>
    </div>
  );
}
