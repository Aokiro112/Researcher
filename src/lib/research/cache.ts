import { SourceItem } from '../types/thread';
import { ExtractedPassage } from './types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ResearchCache {
  private searchCache = new Map<string, CacheEntry<SourceItem[]>>();
  private pageCache = new Map<string, CacheEntry<ExtractedPassage[]>>();
  private maxEntries = 200;

  private cleanup() {
    const now = Date.now();
    for (const [k, v] of this.searchCache.entries()) {
      if (v.expiresAt < now) this.searchCache.delete(k);
    }
    for (const [k, v] of this.pageCache.entries()) {
      if (v.expiresAt < now) this.pageCache.delete(k);
    }
  }

  getSearch(query: string): SourceItem[] | null {
    this.cleanup();
    const key = query.trim().toLowerCase();
    const entry = this.searchCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.searchCache.delete(key);
      return null;
    }
    return entry.data;
  }

  setSearch(query: string, data: SourceItem[], ttlMs = 1000 * 60 * 15): void {
    if (this.searchCache.size >= this.maxEntries) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) this.searchCache.delete(firstKey);
    }
    this.searchCache.set(query.trim().toLowerCase(), {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  getPage(url: string): ExtractedPassage[] | null {
    this.cleanup();
    const key = url.trim();
    const entry = this.pageCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.pageCache.delete(key);
      return null;
    }
    return entry.data;
  }

  setPage(url: string, data: ExtractedPassage[], ttlMs = 1000 * 60 * 30): void {
    if (this.pageCache.size >= this.maxEntries) {
      const firstKey = this.pageCache.keys().next().value;
      if (firstKey) this.pageCache.delete(firstKey);
    }
    this.pageCache.set(url.trim(), {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.searchCache.clear();
    this.pageCache.clear();
  }
}

export const researchCache = new ResearchCache();
