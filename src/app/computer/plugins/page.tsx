'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plug2,
  Mail,
  HardDrive,
  GitBranch,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function PluginsPage() {
  const [tab, setTab] = useState<'plugins' | 'skills'>('plugins');
  const [filter, setFilter] = useState('');

  const connectors = [
    {
      id: 'gcal',
      name: 'Gmail with Calendar',
      desc: 'Search, create, and manage your emails and calendar events.',
      category: 'Popular',
      isNative: true,
      icon: Mail,
      color: 'text-red-500 bg-red-500/10',
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      desc: 'Get in-depth answers and search across your Google Drive content.',
      category: 'Popular',
      isNative: true,
      icon: HardDrive,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'github_mcp_direct',
      name: 'GitHub (MCP)',
      desc: 'Search code, inspect pull requests, and manage issues via Model Context Protocol.',
      category: 'Developer Tools',
      isNative: true,
      icon: GitBranch,
      color: 'text-neutral-700 dark:text-neutral-200 bg-neutral-500/10',
    },
    {
      id: 'notion_mcp',
      name: 'Notion (MCP)',
      desc: 'Search workspace documents and create pages directly on your Notion workspace.',
      category: 'Productivity',
      isNative: true,
      icon: BookOpen,
      color: 'text-neutral-800 dark:text-neutral-100 bg-neutral-500/10',
    },
    {
      id: 'connector_microsoft_365',
      name: 'Microsoft 365',
      desc: 'Connect to Microsoft cloud productivity with OneDrive and SharePoint support.',
      category: 'Popular',
      isNative: true,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-600/10',
    },
  ];

  const filtered = connectors.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.desc.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Plugins & Model Context Protocol (MCP)
        </h1>
        <p className="text-sm text-secondary">
          Extend what Computer can do with custom MCP servers and native tool bundles.
        </p>
      </div>

      {/* Filter and Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border">
        <div className="flex items-center bg-subtle p-0.5 rounded-xl border border-border/60" role="tablist">
          <button
            onClick={() => setTab('plugins')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'plugins' ? 'bg-card text-foreground shadow-2xs' : 'text-secondary hover:text-foreground'
            }`}
            role="tab"
            aria-selected={tab === 'plugins'}
          >
            Plugins
          </button>
          <button
            onClick={() => setTab('skills')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'skills' ? 'bg-card text-foreground shadow-2xs' : 'text-secondary hover:text-foreground'
            }`}
            role="tab"
            aria-selected={tab === 'skills'}
          >
            Skills
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search connectors…"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-subtle text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-2xl bg-card border border-border hover:border-accent/50 hover:bg-soft/30 transition-all shadow-2xs space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.isNative && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Native</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-secondary mt-1 leading-snug">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <span className="text-[11px] text-muted">{item.category}</span>
                <button
                  onClick={() => alert(`Connect ${item.name}`)}
                  className="px-3 py-1 rounded-lg bg-card hover:bg-soft border border-border text-foreground font-medium text-xs transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
