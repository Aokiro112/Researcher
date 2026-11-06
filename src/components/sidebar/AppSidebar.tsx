'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Cpu,
  Bot,
  FileCode2,
  Plug2,
  FolderOpen,
  History,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  User,
  ChevronDown,
  ChevronRight,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Thread } from '@/lib/types/thread';
import { getStoredThreads, deleteThread } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (w: number) => void;
  onOpenAuth: () => void;
  onOpenPlans: () => void;
}

export function AppSidebar({
  isOpen,
  onToggle,
  width,
  onWidthChange,
  onOpenAuth,
  onOpenPlans,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isTeammatesOpen, setIsTeammatesOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isRecentsOpen, setIsRecentsOpen] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setThreads(getStoredThreads());
    const handleStorage = () => setThreads(getStoredThreads());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [pathname]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteThread(id);
    setThreads(getStoredThreads());
  };

  // Keyboard shortcut Ctrl+I / Cmd+I for New Thread
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Handle Drag Resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(420, Math.max(200, moveEvent.clientX));
      onWidthChange(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const navLinks = [
    { label: 'Computer', href: '/computer/tasks', icon: Cpu },
    { label: 'Automations', href: '/automations', icon: Bot },
    { label: 'Artifacts', href: '/artifacts', icon: FileCode2 },
    { label: 'Plugins', href: '/computer/plugins', icon: Plug2 },
  ];

  if (!isOpen) {
    return (
      <div className="fixed top-3 left-3 z-30">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-card border border-border text-secondary hover:text-foreground hover:bg-subtle transition-colors shadow-xs"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="relative flex flex-col h-screen bg-subtle/60 border-r border-border select-none shrink-0 overflow-hidden"
    >
      {/* Header & Logo */}
      <div className="flex items-center justify-between p-3.5 pb-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shadow-xs">
            P
          </div>
          <span className="font-semibold text-foreground tracking-tight text-base group-hover:text-accent transition-colors">
            Perplexity
          </span>
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-soft transition-colors"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Action: New Thread */}
      <div className="px-3 pt-1 pb-2">
        <Link
          href="/"
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-card border border-border/80 text-foreground text-sm font-medium hover:border-accent/60 hover:bg-soft transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            <span>New</span>
          </div>
          <kbd className="text-[10px] font-mono text-muted bg-subtle px-1.5 py-0.5 rounded border border-border">
            ⌃I
          </kbd>
        </Link>
      </div>

      {/* Core Nav Links */}
      <nav className="px-3 space-y-0.5">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-soft text-foreground'
                  : 'text-secondary hover:text-foreground hover:bg-soft/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Scrollable Accordions */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Teammates Section */}
        <div>
          <button
            onClick={() => setIsTeammatesOpen(!isTeammatesOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted px-2 py-1 hover:text-secondary"
          >
            <span>Teammates</span>
            {isTeammatesOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {isTeammatesOpen && (
            <div className="mt-1 px-2 py-2 bg-card/60 rounded-lg border border-border/50 text-xs text-secondary space-y-1.5">
              <p>Teammates are persistent agents that work for you.</p>
              <button
                onClick={() => router.push('/teammates')}
                className="w-full py-1.5 px-2 rounded-md bg-subtle hover:bg-soft text-foreground text-xs font-medium border border-border text-center transition-colors"
              >
                Create new teammate
              </button>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted px-2 py-1 hover:text-secondary"
          >
            <span>Projects</span>
            {isProjectsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {isProjectsOpen && (
            <div className="mt-1 px-2 py-2 text-xs text-muted">
              <p>No projects</p>
            </div>
          )}
        </div>

        {/* Recents Section */}
        <div>
          <button
            onClick={() => setIsRecentsOpen(!isRecentsOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted px-2 py-1 hover:text-secondary"
          >
            <span>Recents</span>
            {isRecentsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {isRecentsOpen && (
            <div className="mt-1 space-y-0.5">
              {threads.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted">No recent sessions</p>
              ) : (
                threads.map((t) => (
                  <div
                    key={t.id}
                    className="group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-secondary hover:text-foreground hover:bg-soft transition-colors cursor-pointer"
                    onClick={() => router.push(`/search/${t.id}`)}
                  >
                    <span className="truncate pr-4">{t.title}</span>
                    <button
                      onClick={(e) => handleDelete(t.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-500 rounded transition-opacity"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-3 border-t border-border bg-card/70 space-y-2 shrink-0">
        <button
          onClick={onOpenPlans}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium border border-accent/20 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>View plans</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">Pro</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-card hover:bg-soft border border-border text-foreground text-xs font-medium transition-colors"
        >
          <User className="w-3.5 h-3.5 text-secondary" />
          <span>Sign In</span>
        </button>
      </div>

      {/* Draggable Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-accent/40 active:bg-accent transition-colors"
        role="separator"
        aria-label="Resize sidebar"
        title="Resize sidebar"
      />
    </aside>
  );
}
