'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image, Cloud, Plug, Upload } from 'lucide-react';

interface AttachmentMenuProps {
  onAttachFile: (file: File) => void;
  onOpenCloudPicker: () => void;
  onOpenPluginPicker: () => void;
}

export function AttachmentMenu({
  onAttachFile,
  onOpenCloudPicker,
  onOpenPluginPicker,
}: AttachmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAttachFile(e.target.files[0]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-soft transition-colors"
        title="Add files, plugins, and more"
        aria-label="Add files, plugins, and more"
      >
        <Plus className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden divide-y divide-border/60 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-1.5 space-y-0.5" role="listbox">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-subtle transition-colors"
            >
              <Upload className="w-4 h-4 text-accent" />
              <div>
                <p className="font-medium">Add images and files</p>
                <p className="text-[10px] text-muted">Upload photos, PDFs, or docs</p>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenCloudPicker();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-subtle transition-colors"
            >
              <Cloud className="w-4 h-4 text-blue-500" />
              <div>
                <p className="font-medium">Add files from cloud</p>
                <p className="text-[10px] text-muted">Google Drive, Dropbox, Box</p>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenPluginPicker();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-subtle transition-colors"
            >
              <Plug className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="font-medium">Use a plugin</p>
                <p className="text-[10px] text-muted">Connect external tools via MCP</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
