import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-embedding-2-preview";

async function embedImage(filePath: string, mimeType: string): Promise<number[]> {
  const base64Data = fs.readFileSync(filePath).toString("base64");

  const result = await ai.models.embedContent({
    model: MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ],
  });

  return result.embeddings![0]!.values!;
}

async function embedVideo(filePath: string, mimeType: string): Promise<number[]> {
  const uploaded = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  let file = uploaded;
  while (file.state === "PROCESSING") {
    await new Promise((r) => setTimeout(r, 2000));
    file = await ai.files.get({ name: file.name! });
  }

  if (file.state === "FAILED") {
    throw new Error(`Video processing failed: ${file.name}`);
  }

  const result = await ai.models.embedContent({
    model: MODEL,
    contents: [
      {
        fileData: {
          fileUri: file.uri!,
          mimeType,
        },
      },
    ],
  });

  ai.files.delete({ name: file.name! }).catch(() => {});

  return result.embeddings![0]!.values!;
}

export async function embedFile(filePath: string, mimeType: string): Promise<number[]> {
  if (mimeType.startsWith("video/")) {
    return embedVideo(filePath, mimeType);
  }
  return embedImage(filePath, mimeType);
}

export async function embedText(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: MODEL,
    contents: [text],
  });

  return result.embeddings![0]!.values!;
}
