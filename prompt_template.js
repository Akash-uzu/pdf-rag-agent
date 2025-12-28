import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./chat";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a friendly conversational chatbot answering questions about the novel "The Silent Patient" by Alex Michaelides.`,
  ],
  [
    [
      "human",
      `You are a friendly conversational chatbot answering questions about the {input}`,
    ],
  ],
]);
const chain = prompt.pipe(model);
chain.invoke();
export { prompt };
