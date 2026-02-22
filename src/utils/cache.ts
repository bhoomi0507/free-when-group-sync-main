type CacheValue<T> = {
  expiresAt: number;
  payload: T;
};

export class InMemoryTtlCache<T> {
  private readonly ttlMs: number;
  private readonly store = new Map<string, CacheValue<T>>();

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const cached = this.store.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return cached.payload;
  }

  set(key: string, payload: T): void {
    this.store.set(key, { payload, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}
