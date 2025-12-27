import fs from "fs";
import PdfParse from "pdf-parse-new";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { LogStreamCallbackHandler } from "@langchain/core/tracers/log_stream";

// console.log("Reading PDF file...");
// const databuffer = fs.readFileSync("pdf/thesilentpatient.pdf");

// console.log("Parsing PDF (this may take a while for large files)...");
// const result = await PdfParse(databuffer);
// console.log(result.text);

const text = `
Chapter One

This is the first sentence.
This is the second sentence.
This is the third sentence.

Chapter Two

Here is another paragraph.
It also has multiple sentences.
This is the final sentence.
`;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 10,
  separators: ["\n\n", "\n", ". ", " "],
  keepSeparator: true,
});

const docs = await splitter.createDocuments([text]);

// docs.forEach((doc, index) => {
//   console.log(`\n--- CHUNK ${index + 1} ---`);
//   console.log(`Length: ${doc.pageContent.length}`);
//   console.log(doc.pageContent);
// });
console.log(JSON.stringify(docs, null, 3), "docs");
