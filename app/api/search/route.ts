import { NextResponse } from "next/server";
import { embedText } from "@/embedder";
import { store } from "@/vector-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, topK } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Provide a 'query' string in the body" },
        { status: 400 }
      );
    }

    const queryEmbedding = await embedText(query);
    const results = store.search(queryEmbedding, topK || 10);

    return NextResponse.json({ query, results });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
