import express from "express";
import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";

const router = express.Router();

router.post<{}>("/", async (req, res) => {
  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

  console.clear();


  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
    limit: "20",
  });

  const assistantIds = myAssistants.data.map((assistant) => assistant.id);
 
  console.log(myAssistants)

  res.json({myAssistants});
});

export default router;
