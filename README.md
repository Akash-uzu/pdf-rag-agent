# RAG PDF Agent

A lightweight Retrieval-Augmented Generation (RAG) agent that extracts context from PDF documents and answers questions strictly based on that content.  
Designed for local use with **Ollama**, focusing on fast iteration, privacy, and full local control.

---

## Features

- Ingest PDF files and convert them into vector embeddings
- Retrieve relevant context for a given question
- Generate context-aware answers using a local LLM
- Streaming responses for a conversational experience
- No cloud dependency — runs fully on your machine

---

## Prerequisites

### 1. Node.js
- Node.js v18 or later recommended

### 2. Ollama (Required)

You **must run Ollama locally**.

Install Ollama from:  
https://ollama.com

Start Ollama and pull required models:

```bash
ollama serve
ollama pull nomic-embed-text
ollama pull llama3
```
## Project Structure
text
Copy code
rag-pdf-agent/
│── ingest.js          # PDF ingestion & vector creation
│── chat.js            # Ask questions using RAG
│── vectorstore.json   # Generated vector store (local)
│── pdf/               # Place your PDFs here
│── README.md


## Usage
## 1. Add Your PDF
Place your PDF file inside the pdf/ folder.

## Example:

text
Copy code
pdf/thesilentpatient.pdf
## 2. Ingest the PDF
This extracts text, splits it into chunks, generates embeddings, and saves them locally.

bash
Copy code
node ingest.js
After successful ingestion, a vectorstore.json file will be created.

## 3. Ask Questions
Run the chat agent with your question:

bash
Copy code
node chat.js "What happened to Alicia after the incident?"
The agent will:

Retrieve relevant context from the PDF

Paraphrase and explain answers naturally

Stream the response in real time

## Important Notes
Answers are generated only from the provided PDF context

If the information is not present in the document, the agent will say so

Larger PDFs may take longer during ingestion

Streaming requires a compatible Ollama model

## Configuration
You can tweak the following:

Chunk size & overlap (ingest.js)
Number of retrieved chunks (chat.js)
LLM model (llama3, qwen2.5, etc.)
Temperature for more or less creative responses
Why Local Ollama?
Full data privacy
No API keys
No rate limits
Faster iteration for experimentation
Ideal for learning RAG internals
Disclaimer
This project is for educational and experimental purposes.
Ensure you have the right to process and query the PDFs you use.

### Future Improvements
Persistent vector DB (FAISS / Chroma)

Web UI with streaming responses

Multi-PDF support

Source citations per answer

Chapter-aware retrieval
