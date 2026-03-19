import express from "express";
import multer from "multer";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { embedFile, embedText } from "./embedder.js";
import { store } from "./vector-store.js";

const app = express();
app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are supported"));
    }
  },
});

app.post("/embed", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { description, tags } = req.body;
    const filePath = path.resolve(req.file.path);
    const embedding = await embedFile(filePath, req.file.mimetype);

    const item = {
      id: uuid(),
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      embedding,
      description: description || undefined,
      tags: tags ? (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : tags) : undefined,
      createdAt: new Date().toISOString(),
    };

    store.add(item);

    const { embedding: _emb, ...safe } = item;
    res.json({ message: "Embedded and stored", item: safe });
  } catch (err: any) {
    console.error("Embed error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/embed/batch", upload.array("files", 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const results = [];

    for (const file of files) {
      const filePath = path.resolve(file.path);
      const embedding = await embedFile(filePath, file.mimetype);

      const item = {
        id: uuid(),
        filename: file.originalname,
        mimetype: file.mimetype,
        embedding,
        createdAt: new Date().toISOString(),
      };

      store.add(item);
      const { embedding: _emb, ...safe } = item;
      results.push(safe);
    }

    res.json({ message: `Embedded ${results.length} files`, items: results });
  } catch (err: any) {
    console.error("Batch embed error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/search", async (req, res) => {
  try {
    const { query, topK } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Provide a 'query' string in the body" });
      return;
    }

    const queryEmbedding = await embedText(query);
    const results = store.search(queryEmbedding, topK || 10);

    res.json({ query, results });
  } catch (err: any) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/search/similar", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Upload a file to find similar content" });
      return;
    }

    const topK = req.body.topK ? parseInt(req.body.topK) : 10;
    const filePath = path.resolve(req.file.path);
    const queryEmbedding = await embedFile(filePath, req.file.mimetype);
    const results = store.search(queryEmbedding, topK);

    res.json({ query: req.file.originalname, results });
  } catch (err: any) {
    console.error("Similar search error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/items", (_req, res) => {
  res.json({ count: store.size, items: store.list() });
});

app.delete("/items/:id", (req, res) => {
  const removed = store.remove(req.params.id);
  if (removed) {
    res.json({ message: "Deleted" });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`rag-fusion running on http://localhost:${PORT}`);
  console.log(`Store: ${store.size} items`);
});
