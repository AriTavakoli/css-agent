import OpenAI from "openai";
import express from "express";
import {
  createEmbedding,
  batchCreateEmbedding,
  createQueryEmbedding,
} from "../../../utils/create-embeddings";
import { pineconeUpsert, batchPineconeUpsert } from "../../../utils/upsert";
import { StylesRecord, styles } from "../../../data/elements-index";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const embeddings = await batchCreateEmbedding(styles as StylesRecord[]);

    // Prepare vectors for upsert
    const vectors = styles.map((style) => ({
      id: style.id,
      values: embeddings[style.id].data[0].embedding,
      metadata: style.metadata,
    }));

    // Perform batch upsert
    await batchPineconeUpsert(vectors);

    res.status(200).json({
      success: true,
      message: "Embeddings and upserts completed successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
