import { CACHE_CONFIG } from '../config/constants.js';

export class PlaylistCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || CACHE_CONFIG.MAX_SIZE;
    this.ttl = options.ttl || CACHE_CONFIG.TTL;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  remove(key) {
    this.cache.delete(key);
  }

  get size() {
    return this.cache.size;
  }
}

export const playlistCache = new PlaylistCache();
