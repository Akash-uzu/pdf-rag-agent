import fs from "fs";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const savedData = JSON.parse(fs.readFileSync("vectorstore.json", "utf8"));

console.log(
  `Loaded ${savedData.metadata.chunks} chunks from ${savedData.metadata.sourceFile}\n`
);

const vectorStore = new MemoryVectorStore(embeddings);

vectorStore.memoryVectors = savedData.memoryVectors.map((v) => ({
  content: v.content,
  embedding: new Float32Array(v.embedding),
  metadata: v.metadata ?? {},
}));

export const model = new ChatOllama({
  model: "deepseek-v3.2:cloud",
  baseUrl: "http://localhost:11434",
  temperature: 0.4,
});

const question = process.argv[2];
if (!question) {
  console.error('Usage: node chat.js "Your question here"');
  process.exit(1);
}

console.log(`Question: ${question}\n`);

// Expand query for better retrieval
async function expandQuery(question) {
  const expansionPrompt = `Given this question about "The Silent Patient": "${question}"

List 2 related search queries that would help find relevant passages (one per line):`;
  
  try {
    const response = await model.invoke([{ role: "user", content: expansionPrompt }]);
    const queries = response.content
      .split('\n')
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 5);
    return [question, ...queries.slice(0, 2)];
  } catch {
    return [question];
  }
}

// Multi-query retrieval
const queries = await expandQuery(question);
console.log(`Searching with ${queries.length} query variations...\n`);

const allDocsWithScores = [];
for (const q of queries) {
  const docs = await vectorStore.similaritySearchWithScore(q, 20);
  allDocsWithScores.push(...docs);
}

// Deduplicate and sort by score
const uniqueDocsMap = new Map();
for (const [doc, score] of allDocsWithScores) {
  const idx = doc.metadata.chunkIndex;
  if (!uniqueDocsMap.has(idx) || uniqueDocsMap.get(idx)[1] > score) {
    uniqueDocsMap.set(idx, [doc, score]);
  }
}

const sortedDocs = Array.from(uniqueDocsMap.values())
  .sort((a, b) => a[1] - b[1])
  .slice(0, 40);

// Filter by relevance threshold
const relevantDocs = sortedDocs
  .filter(([_, score]) => score < 0.75)
  .map(([doc, score]) => ({ doc, score }));

console.log(`Found ${relevantDocs.length} relevant chunks\n`);

// Show top excerpts
console.log('=== Top Retrieved Excerpts ===');
relevantDocs.slice(0, 5).forEach(({ doc, score }, i) => {
  console.log(`[${i + 1}] Score: ${score.toFixed(3)} | ${doc.metadata.preview}...`);
});
console.log('==============================\n');

// Build context
const context = relevantDocs
  .map(({ doc }, i) => `[Excerpt ${i + 1}]\n${doc.pageContent}`)
  .join("\n\n---\n\n");

const stream = await model.stream([
  {
    role: "system",
    content: `You are an expert literary analyst specializing in "The Silent Patient" by Alex Michaelides.

Guidelines:
- Synthesize information from ALL ${relevantDocs.length} provided excerpts
- Connect plot points and character development across the narrative
- ALWAYS paraphrase - never quote verbatim unless explicitly requested
- For complex questions, consider chronological order and narrative structure
- If excerpts seem incomplete, acknowledge what's provided and what might be missing
- Be conversational but insightful`,
  },
  {
    role: "user",
    content: `Context (${relevantDocs.length} excerpts from the book):\n\n${context}\n\nQuestion: ${question}`,
  },
]);

process.stdout.write("Answer:\n\n");

for await (const chunk of stream) {
  if (chunk?.content) {
    process.stdout.write(chunk.content);
  }
}

process.stdout.write("\n\n");  