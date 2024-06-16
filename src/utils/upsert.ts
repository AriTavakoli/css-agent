import {
  Pinecone,
  PineconeRecord,
  ServerlessSpecCloudEnum,
} from "@pinecone-database/pinecone";

export const pineconeUpsert = async (vectors: Array<PineconeRecord>) => {
  const pinecone = new Pinecone();
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  try {
    // Upsert each chunk of vectors into the index
    await index.namespace(" ").upsert(vectors);

    return true;
  } catch (e) {
    throw new Error(`Error upserting vectors into index: ${e}`);
  }
};


export const batchPineconeUpsert = async (pcRecords: Array<PineconeRecord>) => {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.Index(process.env.PINECONE_INDEX);

  await Promise.all(
    pcRecords.map(async (vector) => {
      try {
        await index.namespace(" ").upsert([vector]);
        return true;
      } catch (e) {
        throw new Error(`Error upserting vectors into index: ${e}`);
      }
    })
  );
};
