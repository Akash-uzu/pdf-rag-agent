import fs from "fs";
import pdf from "pdf-parse-new";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

const buffer = fs.readFileSync("pdf/thesilentpatient.pdf");
const result = await pdf(buffer);

if (!result.text?.trim()) throw new Error("No text extracted");

const text = result.text
  .replace(/\r\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1800,
  chunkOverlap: 400,
});

const docs = await splitter.createDocuments([text]);

docs.forEach((doc, i) => {
  doc.metadata = {
    source: "thesilentpatient.pdf",
    chunkIndex: i,
    preview: doc.pageContent.slice(0, 100).replace(/\n/g, " "),
  };
});

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

const data = {
  metadata: {
    sourceFile: "thesilentpatient.pdf",
    pages: result.numpages,
    chunks: docs.length,
    model: "nomic-embed-text",
    createdAt: new Date().toISOString(),
  },
  memoryVectors: vectorStore.memoryVectors.map((v) => ({
    content: v.content,
    embedding: Array.from(v.embedding),
    metadata: v.metadata,
  })),
};

fs.writeFileSync("vectorstore.json", JSON.stringify(data, null, 2));
