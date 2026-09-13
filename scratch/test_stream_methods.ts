import { createDataStreamResponse } from "ai";

function writeTextStream(dataStream: any, text: string) {
  dataStream.write(`0:${JSON.stringify(text)}\n`);
}

const sampleText = `The courses offered in Semester 1 are:
- **AIDS101**: Introduction to Artificial Intelligence & Data Science — Foundational concepts.`;

const res = createDataStreamResponse({
  execute: (dataStream) => {
    writeTextStream(dataStream, sampleText);
  },
});

res.text().then((text) => {
  console.log("FORMATTED STREAM OUTPUT:");
  console.log(text);
});
