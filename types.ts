export interface EmbeddedItem {
  id: string;
  filename: string;
  mimetype: string;
  embedding: number[];
  description?: string;
  tags?: string[];
  createdAt: string;
}

export interface SearchResult {
  item: {
    id: string;
    filename: string;
    mimetype: string;
    description?: string;
    tags?: string[];
    createdAt: string;
  };
  score: number;
}

export interface VectorStoreData {
  items: EmbeddedItem[];
}
