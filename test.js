import readline from "readline";
import { ChatOllama } from "@langchain/ollama";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Ask: ", async (question) => {
  const model = new ChatOllama({
    model: "deepseek-v3.2:cloud",
    baseUrl: "http://localhost:11434",
    temperature: 1,
  });

  const stream = await model.stream([
    {
      role: "system",
      content: "You are a friendly conversational chatbot answering questions.",
    },
    {
      role: "user",
      content: question,
    },
  ]);

  for await (const chunk of stream) {
    process.stdout.write(chunk.content || "");
  }

  rl.close();
});
