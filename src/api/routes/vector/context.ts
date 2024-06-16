import express from "express";
import { getContext } from "../../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    const lastMessage =
      messages.length > 1 ? messages[messages.length - 1] : messages[0];
    const context = (await getContext(
      lastMessage.content,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    res.json({ context });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
