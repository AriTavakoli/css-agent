import express from "express";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import { logInit } from "../../lib/logResults";
import { Thread } from "../../lib/thread";
import { editCss } from "../../tools/functions/css-properties";
import { editInteractions } from "../../tools/functions/interaction-properties";
import { tools } from "../../tools/tools-index";
import * as c from "ansi-colors";

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

  console.clear();

  const css = currentStyleBlock.styleLess;
  const variants = currentStyleBlock.variants;

  const chatRequest = traceable(async (user_input) => {
    const res: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
          You are a css editor assistant. You only edit properties that the user asks for. The user provides many properties that aren't related to their query. 
          Its very important that you properly distinguish between the properties that are related to the user's query and the ones that are not. 
           `,
        },
        {
          role: "user",
          content: constructQuery(user_input, css, variants),
        },
      ],
      tools: tools,
      tool_choice: "auto",
    });
    return res.choices[0].message?.tool_calls;
  });

  try {
    const toolCalls = await chatRequest(text);

    logInit("DELEGATOR", toolCalls, "blueBright");

    const results = await Promise?.all(
      toolCalls?.map(async (toolCall) => {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        switch (functionName) {
          case "editCss":
            return await thread.cssEditor.editCss({
              css: functionArgs.css,
              text: functionArgs.text,
            });
          case "editInteractions":
            return await thread.interactionEditor.editInteractions({
              variants: functionArgs.variants,
              text: functionArgs.text,
            });
          default:
            throw new Error(`Function ${functionName} not found.`);
        }
      })
    );

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
