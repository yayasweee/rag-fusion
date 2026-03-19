import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import path from "node:path";
import fs from "node:fs/promises";
import { embedFile } from "@/embedder";
import { store } from "@/vector-store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video files are supported" }, { status: 400 });
    }

    const description = formData.get("description") as string | null;
    let tags = formData.get("tags") as string | null | string[];
    
    if (typeof tags === "string") {
      tags = tags.split(",").map(t => t.trim());
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempFileName = `${uuid()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", tempFileName);
    
    await fs.writeFile(filePath, buffer);

    const embedding = await embedFile(filePath, file.type);

    const item = {
      id: uuid(),
      filename: file.name,
      mimetype: file.type,
      embedding,
      description: description || undefined,
      tags: tags || undefined,
      createdAt: new Date().toISOString(),
      url: `/uploads/${tempFileName}`,
    };

    store.add(item);

    const { embedding: _emb, ...safe } = item;
    return NextResponse.json({ message: "Embedded and stored", item: safe });
  } catch (err: any) {
    console.error("Embed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
