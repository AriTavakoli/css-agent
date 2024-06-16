import OpenAI from "openai";

import editGrid from "./grid-properties";
import editShadow from "./shadow-properties";
import { gridTools, shadowTools } from "../../tools-css";
import { Model } from "../../../api/routes/suggestion";

export default async function editCss(css, text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const messages = [
      {
        role: "system",
        content: `You are a css property editor that will take my query and determine what tools will be needed to get it all done. respond in JSON format only. Sometimes you will need to call multiple tools to get the job done. Here is my request: ${text} & my current css is: ${css}
        combine the css properties to make a final css string like this example. Never include the class name or selector. Only the properties. 
        {
        "css" : "display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;"
      }
        `,
      },
    ];

    // Initial call to the model
    const firstResponse = await openai.chat.completions.create({
      model: Model.gpt3,
      messages: messages,
      tools: [...gridTools, ...shadowTools],
      tool_choice: "auto",
      response_format: { type: "json_object" },
    });

    const toolCalls = firstResponse.choices[0].message?.tool_calls || [];
    messages.push(firstResponse.choices[0].message);

    const availableFunctions = {
      editGrid,
      editShadow,
    };

    const results = [];

    // Sequentially process each tool call
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];

      if (functionToCall) {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log("RUNNING FUNCTION:", functionName);

        const functionResult = await functionToCall(
          functionArgs.css,
          functionArgs.text
        );
        results.push(functionResult);

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResult,
        }); // Extend conversation with function response
      }
    }

    // Final response from the model after function calls
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: { type: "json_object" },
    });

    console.log("FINAL RESPONSE:", finalResponse);

    return finalResponse.choices;
  } catch (error) {
    console.error("Error while fetching AI suggestions:", error);
    return []; // Ensure function returns even in case of error
  }
}
