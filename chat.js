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

vectorStore.memoryVectors = savedData.memoryVectors.map(v => ({
  content: v.content,
  embedding: new Float32Array(v.embedding),
  metadata: v.metadata ?? {},
}));

const model = new ChatOllama({
  model: "nemotron-3-nano:30b-cloud",
  baseUrl: "http://localhost:11434",
  temperature: 0.4,
});

const question = process.argv[2];
if (!question) {
  console.error('Usage: node chat.js "Your question here"');
  process.exit(1);
}

console.log(`Question: ${question}\n`);

const docsWithScores = await vectorStore.similaritySearchWithScore(
  question,
  12
);

const topDocs = docsWithScores.slice(0, 30).map(([doc]) => doc);

const context = topDocs
  .map((doc, i) => `[Excerpt ${i + 1}]\n${doc.pageContent}`)
  .join("\n\n---\n\n");

const stream = await model.stream([
  {
    role: "system",
    content: `You are a friendly conversational chatbot answering questions about the novel "The Silent Patient" by Alex Michaelides.

Rules:
- Use ONLY the provided context for factual grounding
- NEVER copy sentences word-for-word unless explicitly asked
- Always paraphrase in your own words
- Explain naturally, like telling the story to a friend
- You are penalized for quoting the text verbatim
- If the answer is unclear from context, say so casually`,
  },
  {
    role: "user",
    content: `Context:\n\n${context}\n\nQuestion: ${question}`,
  },
]);

process.stdout.write("Answer:\n\n");

for await (const chunk of stream) {
  if (chunk?.content) {
    process.stdout.write(chunk.content);
  }
}

process.stdout.write("\n\n");
