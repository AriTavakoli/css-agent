import express from "express";
import OpenAI from "openai";
import getCurrentWeather from "../../tools/functions/getWeather";
import { availableFunctions, tools } from "../../tools/tools-index";
import { defaultPrompt } from "../../prompts/prompt-index";
import { getContext } from "../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

const router = express.Router();

type SuggestionResponse = string[];

router.get<{}, SuggestionResponse>("/", async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const text = req.query.text;
  const css = req.query.css;

  console.log('TEXT:', text)
  console.log('CSS:', css)

  const { messages } = req.body;
  const context = (await getContext(
    text,
    0.7,
    false
  )) as ScoredPineconeRecord[];

  const { content } = context[0].metadata;

  console.log('CONTEXT:', context)

  if (text && text.length) {
    console.log("Received text:", text);

    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
            You are a css modifier. i want you to response and modify this css in the exact format provided. You will need to response in only json format 
            example response format delimmitted by triple quotes:
            """
            {
              "css": "display: flex; max-width: 750px; margin-right: auto; margin-left: auto; flex-direction: column; justify-content: flex-start; align-items: center; border-bottom: 1px solid red; text-align: center;"
            } 
            """

          change the following csss ${css} in this way ${text}. 
          use this css delimmited by 4 quotes as a reference """"${content}"""".`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
      });

      console.log(response.choices[0].message.content);

      // res.json({ response });
    } catch (error) {
      console.error("Error while fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  } else {
    res.status(400).json({ message: "No input text provided." });
    console.log("Request failed: No input text provided.");
  }
});

export default router;
