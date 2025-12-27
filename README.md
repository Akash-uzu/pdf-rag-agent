Understood—I will keep the exact structural flow and formatting style of your original document while cleaning up the layout, fixing the code blocks, and polishing the language for a professional finish.

RAG PDF Agent
A lightweight Retrieval-Augmented Generation (RAG) agent that extracts context from PDF documents and answers questions strictly based on that content.

Designed for local use with Ollama, focusing on fast iteration, privacy, and full local control.

Features
Ingest PDF files and convert them into vector embeddings.

Retrieve relevant context for a given question.

Generate context-aware answers using a local LLM.

Streaming responses for a conversational experience.

No cloud dependency — runs fully on your machine.

Prerequisites
1. Node.js
Node.js v18 or later recommended.

2. Ollama (Required)
You must run Ollama locally. Install it from ollama.com.

Start Ollama and pull the required models:

Bash

ollama serve
ollama pull nomic-embed-text
ollama pull llama3
Project Structure
Plaintext

rag-pdf-agent/
│── ingest.js          # PDF ingestion & vector creation
│── chat.js            # Ask questions using RAG
│── vectorstore.json   # Generated vector store (local)
│── pdf/               # Place your PDFs here
│── README.md          # Documentation
Usage
1. Add Your PDF
Place your PDF file inside the pdf/ folder.

Example: pdf/thesilentpatient.pdf

2. Ingest the PDF
This extracts text, splits it into chunks, generates embeddings, and saves them locally.

Bash

node ingest.js
After successful ingestion, a vectorstore.json file will be created.

3. Ask Questions
Run the chat agent with your question:

Bash

node chat.js "What happened to Alicia after the incident?"
The agent will:

Retrieve relevant context from the PDF.

Paraphrase and explain answers naturally.

Stream the response in real time.

Important Notes
Strict Context: Answers are generated only from the provided PDF context.

Fallback: If the information is not present in the document, the agent will say so.

Performance: Larger PDFs may take longer during ingestion.

Compatibility: Streaming requires a compatible Ollama model.

Configuration
You can tweak the following settings:

Chunk size & overlap: Located in ingest.js.

Retrieval Depth: Number of retrieved chunks in chat.js.

Model Selection: Switch between llama3, qwen2.5, etc.

Temperature: Adjust for more or less creative responses.

Why Local Ollama?
Full data privacy: No data leaves your device.

No API keys: Completely free to use.

No rate limits: Unlimited queries and documents.

Ideal for learning: Great for experimentation with RAG internals.

Future Improvements
Persistent vector DB (FAISS / Chroma).

Web UI with streaming responses.

Multi-PDF support.

Source citations per answer.

Chapter-aware retrieval.

Disclaimer
This project is for educational and experimental purposes. Ensure you have the right to process and query the PDFs you use.