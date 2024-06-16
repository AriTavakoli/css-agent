import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { trace } from "console";
import { ChatCompletion } from "openai/resources";
import { tools } from "../tools-index";
import { editInteractions } from "./interaction-properties";
import { cssPropertyTools } from "../../lib/css-editing/css-tools-index";
import { editGrid } from "./style-tools/grid-properties";
import { editShadow } from "./style-tools/shadow-properties";
import * as c from "ansi-colors";
import { logInit, logResults } from "../../lib/logResults";

export const editCss = async (args) => {
  const { css, text } = args;

  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

  const pipeline = traceable(async (user_input) => {
    const res: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a css editor assistant. 
            You will need take in the user's query and determine the correct tool to use. You need to make sure you are choosing the right tool depending on the type of properties the user is asking to change. 
            Determine what to do with the following css: ${css} by following command: ${text}
            Respond in JSON format only.
            `,
        },
        {
          role: "user",
          content: `Determine what to do with the following css: ${css} by following command: ${text}`,
        },
      ],
      temperature: 0.1,
      tools: cssPropertyTools,
      response_format: { type: "json_object" },
      tool_choice: "auto",
    });
    return res.choices[0].message?.tool_calls;
  });

  try {
    const response = await pipeline(text);
    const toolCalls = response;

    const availableFunctions = {
      editGrid,
      editShadow,
    };

    logInit("CSS-EDITOR", toolCalls, "yellow");
    console.time(c.yellow("[CSS-EDITOR] - execution time : "));

    const results = await Promise.all(
      toolCalls?.map(async (toolCall) => {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];

        if (!functionToCall) {
          throw new Error(`Function ${functionName} not found.`);
        }

        const functionArgs = JSON.parse(toolCall.function.arguments);

        switch (functionName) {
          case "editGrid":
            return functionToCall({
              css: functionArgs.css,
              text: functionArgs.text,
            });
          case "editShadow":
            return functionToCall({
              css: functionArgs.css,
              text: functionArgs.text,
            });
          default:
            throw new Error(`Function ${functionName} not found.`);
        }
      })
    );
    console.timeEnd(c.yellow("[CSS-EDITOR] - execution time : "));
    logResults(results, "CSS-EDITOR", "yellow");

    return results;
  } catch (error) {
    console.error("Error processing CSS edits:", error);
    return []; // Handle error or return an error state as appropriate
  }
};
