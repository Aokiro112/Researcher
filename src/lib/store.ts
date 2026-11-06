'use client';

import { useState, useEffect } from 'react';
import { Thread, ThreadEntry, SearchMode } from './types/thread';

const STORAGE_KEY = 'openpplx_sessions_v1';

export function getStoredThreads(): Thread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveThread(thread: Thread) {
  if (typeof window === 'undefined' || thread.isIncognito) return;
  try {
    const threads = getStoredThreads().filter((t) => t.id !== thread.id);
    threads.unshift(thread);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads.slice(0, 50)));
  } catch (e) {
    console.error('Error saving thread:', e);
  }
}

export function deleteThread(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const threads = getStoredThreads().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {}
}
