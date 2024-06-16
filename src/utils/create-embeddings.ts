import OpenAI from "openai";
import { StylesRecord } from "../data/elements-index";

export async function createEmbedding(
  input: string
): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, " "),
    });
    return response;
  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}

export async function batchCreateEmbedding(
  inputArray: StylesRecord[]
): Promise<Record<string, OpenAI.Embeddings.CreateEmbeddingResponse>> {
  try {
    const batch = await Promise.allSettled(
      inputArray.map(({ id, styleLess, metadata }) =>
        createEmbedding(metadata.description).then((embedding) => [id, embedding])
      )
    );

    const embeddings = batch
      .map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.error("Error creating embedding for id: ", result.reason);
          return null;
        }
      })
      .filter((result) => result !== null) as [
      string,
      OpenAI.Embeddings.CreateEmbeddingResponse
    ][];

    return Object.fromEntries(embeddings);
  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}

export async function createQueryEmbedding(
  query: string
): Promise<OpenAI.Embeddings.Embedding["embedding"]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: [query],
  });

  return response.data[0].embedding;
}
