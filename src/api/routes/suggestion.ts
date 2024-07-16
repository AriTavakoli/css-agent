import * as c from "ansi-colors";
import express from "express";
import { wrapOpenAI } from "langsmith/wrappers";
import OpenAI from "openai";
import { Thread } from "../../lib/thread";

const router = express.Router();

router.post<{}>("/", async (req, res) => {
  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
  const {
    currentStyleBlock,
    currentElement,
    inputValue: text,
    minimalTreeStructure,
  } = req.body;

  console.time(c.cyanBright("Total time"));

  const thread: Thread = new Thread({
    openai,
    userPayload: {
      currentStyleBlock,
      currentElement,
      inputValue: text,
      minimalTreeStructure,
    },
  });
  try {
    const results = await thread.invokeLLM(text);

    const finalResult = await thread.finalPipeline(results);

    console.timeEnd(c.cyanBright("Total time"));

    res.json(finalResult);
  } catch (error) {
    console.error("Error while fetching AI suggestions:", error);
    res.status(500).json({ message: "Failed to fetch AI suggestions" });
  }
});

export default router;

function constructQuery(text: string, css: string, variants: string) {
  let message = `I want you to take this css which is in the double brackets {{ ${css} }} and then modify it using the following text in double brackets: {{ ${text} }}.`;
  return message;
}
