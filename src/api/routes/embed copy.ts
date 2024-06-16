import OpenAI from "openai";
import express from "express";
import { createEmbedding, batchCreateEmbedding } from "../../utils/create-embeddings";
import { pineconeUpsert, batchPineconeUpsert } from "../../utils/upsert";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const dataStr = "background: linear-gradient(to bottom, orange, yellow);";
    const embedding = await createEmbedding(dataStr);
    const vectors = embedding.data[0].embedding;
    const pineConeUpsert = await pineconeUpsert([
      {
        id: "background-gradient",
        values: vectors,
      },
    ]);

    console.log("Pinecone upsert result:", pineConeUpsert);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
