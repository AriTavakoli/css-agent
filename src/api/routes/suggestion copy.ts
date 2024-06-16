import express from "express";
import OpenAI from "openai";
import getCurrentWeather from "../../tools/functions/getWeather";
import { tools } from "../../tools/tools-index";
import { defaultPrompt } from "../../prompts/prompt-index";
import getVariables from "../../tools/functions/getVariables";
import autocomplete from "../../tools/functions/autocomplete";
import editCss from "../../tools/functions/style-tools/css-properties";

const router = express.Router();

type SuggestionResponse = string[];

router.get<{}, SuggestionResponse>("/", async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const text = req.query.text;

  console.log("Received text:", text);

  if (text && text.length) {
    console.log("Received text:", text);

    const messages = [
      {
        role: "system",
        content: "Design assistant autocomplete",
      },
      {
        role: "user",
        content: "I want to create a hero section on my website.",
      },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: messages,
        tool_choice: "auto",
        tools,
      });

      const responseMessage = response.choices[0].message;
      const toolCalls = responseMessage.tool_calls;

      const availableFunctions = {
        edit_css: editCss,
        autocomplete: autocomplete,
      };

      if (Object.keys(toolCalls).length) {
        console.log("Tool calls:", toolCalls);
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionToCall = availableFunctions[functionName];
          const functionArgs = JSON.parse(toolCall.function.arguments);
          const functionResponse = await functionToCall(functionArgs);
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: functionResponse,
          });

          console.log("Function response:", functionResponse);
          console.log("Messages:", messages);
          // extend conversation with function response
        }
        // const secondResponse = await openai.chat.completions.create({
        //     model: "gpt-3.5-turbo-0125",
        //     messages: messages,
        // }); // get a new response from the model where it can see the function response
        // console.log(secondResponse.choices)
      }

      res.json({ response });
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
