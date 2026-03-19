import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { v4 as uuid } from "uuid";
import { embedFile } from "@/embedder";
import { store } from "@/vector-store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const topKParam = formData.get("topK") as string | null;
    const topK = topKParam ? parseInt(topKParam) : 10;
    
    if (!file) {
      return NextResponse.json({ error: "Upload a file to find similar content" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempFileName = `${uuid()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", tempFileName);
    
    await fs.writeFile(filePath, buffer);

    const queryEmbedding = await embedFile(filePath, file.type);
    const results = store.search(queryEmbedding, topK);
    
    await fs.unlink(filePath).catch(() => {});

    return NextResponse.json({ query: file.name, results });
  } catch (err: any) {
    console.error("Similar search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
