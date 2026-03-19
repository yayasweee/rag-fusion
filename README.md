# rag-fusion

multimodal RAG backend that embeds images and videos using Google's Gemini embedding model, then lets you search through them with natural language queries.

built this for a tiktok-style video discovery use case - users upload videos, videos get embedded, and when someone searches for something like "dog on a skateboard" it actually finds relevant videos based on visual similarity instead of just relying on titles/tags.

## how it works

- images get embedded directly via base64 -> Gemini embedding API
- videos go through the Files API first (Gemini doesn't support inline video), then get embedded
- embeddings are 3072-dim vectors stored locally in a JSON file
- search uses cosine similarity to rank results

## setup

```bash
npm install
export GEMINI_API_KEY="your-key"
npm run dev
```

runs on port 3000 by default.

## api routes

**embed stuff:**
```bash
# single file
curl -X POST http://localhost:3000/api/embed -F "file=@video.mp4" -F "description=cat jumping off table"
```

**search:**
```bash
# text search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "funny cat", "topK": 5}'

# find similar (upload a reference image/video)
curl -X POST http://localhost:3000/api/search/similar -F "file=@reference.jpg"
```

**manage:**
```bash
# list everything
curl http://localhost:3000/api/items

# delete
curl -X DELETE http://localhost:3000/api/items/<id>
```

## pages

- `/` - home
- `/upload` - drag and drop upload with description/tags
- `/gallery` - browse and search through embedded media

## notes

- video embeddings are capped at 1 min by Gemini, longer videos get truncated
- the vector store is just a JSON file right now - works fine for a few thousand items, swap it out for something like Qdrant or Pinecone if you need scale
- you need a Gemini API key, grab one from [Google AI Studio](https://aistudio.google.com/apikey)
- model used: `gemini-embedding-2-preview`

## stack

- next.js 16 + react 19
- tailwind + shadcn/ui
- `@google/genai` sdk
- cosine similarity for retrieval
