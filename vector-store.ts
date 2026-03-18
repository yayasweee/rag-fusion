import fs from "node:fs";
import path from "node:path";
import type { EmbeddedItem, SearchResult, VectorStoreData } from "./types.js";

const STORE_PATH = path.resolve("data", "vectors.json");

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

class VectorStore {
  private items: EmbeddedItem[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const data: VectorStoreData = JSON.parse(raw);
        this.items = data.items;
        console.log(`Loaded ${this.items.length} items from store`);
      }
    } catch {
      this.items = [];
    }
  }

  private save(): void {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data: VectorStoreData = { items: this.items };
    fs.writeFileSync(STORE_PATH, JSON.stringify(data));
  }

  add(item: EmbeddedItem): void {
    this.items.push(item);
    this.save();
  }

  remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    if (this.items.length < before) {
      this.save();
      return true;
    }
    return false;
  }

  search(queryEmbedding: number[], topK: number = 10): SearchResult[] {
    const scored: SearchResult[] = this.items.map((item) => ({
      item: {
        id: item.id,
        filename: item.filename,
        mimetype: item.mimetype,
        ...(item.description && { description: item.description }),
        ...(item.tags && { tags: item.tags }),
        createdAt: item.createdAt,
      },
      score: cosine(queryEmbedding, item.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  list(): Omit<EmbeddedItem, "embedding">[] {
    return this.items.map(({ embedding, ...rest }) => rest);
  }

  get(id: string): EmbeddedItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  get size(): number {
    return this.items.length;
  }
}

export const store = new VectorStore();
