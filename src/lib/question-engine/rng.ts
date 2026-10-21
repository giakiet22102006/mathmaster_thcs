// ==============================================================================
// MathMaster THCS - Bộ Sinh Số Ngẫu Nhiên Có Seed (Mulberry32 PRNG)
// File: src/lib/question-engine/rng.ts
// Cho phép tái lập 100% câu hỏi từ cùng bộ (templateId, seed)
// ==============================================================================

export interface PRNG {
  next(): number; // [0, 1)
  nextInt(min: number, max: number): number; // [min, max] inclusive
  nextChoice<T>(arr: T[]): T;
  pick<T>(arr: T[]): T;
  shuffle<T>(arr: T[]): T[];
}

export function createRNG(seedInput?: number | string): PRNG {
  let s: number;
  if (typeof seedInput === 'number') {
    s = seedInput >>> 0;
  } else if (typeof seedInput === 'string' && seedInput.trim()) {
    // FNV-1a hash to 32-bit integer
    let hash = 2166136261;
    for (let i = 0; i < seedInput.length; i++) {
      hash ^= seedInput.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    s = hash >>> 0;
  } else {
    s = Math.floor(Math.random() * 0xffffffff) >>> 0;
  }

  // Thuật toán Mulberry32: phân phối đồng đều, chu kỳ 2^32, hiệu năng cao
  function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    if (low >= high) return low;
    return Math.floor(next() * (high - low + 1)) + low;
  }

  function nextChoice<T>(arr: T[]): T {
    if (!arr || arr.length === 0) throw new Error('Cannot pick from empty array');
    const idx = Math.floor(next() * arr.length);
    return arr[idx];
  }

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return { next, nextInt, nextChoice, pick: nextChoice, shuffle };
}

export class Mulberry32 implements PRNG {
  private rng: PRNG;
  constructor(seedInput?: number | string) {
    this.rng = createRNG(seedInput);
  }
  next(): number {
    return this.rng.next();
  }
  nextInt(min: number, max: number): number {
    return this.rng.nextInt(min, max);
  }
  nextChoice<T>(arr: T[]): T {
    return this.rng.nextChoice(arr);
  }
  pick<T>(arr: T[]): T {
    return this.rng.nextChoice(arr);
  }
  shuffle<T>(arr: T[]): T[] {
    return this.rng.shuffle(arr);
  }
}
