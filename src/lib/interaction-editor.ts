import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { cssPropertyTools } from "./css-editing/css-tools-index";
import { logInit, logResults } from "./logger";
import { editGrid } from "../tools/functions/style-tools/grid-properties";
import { editShadow } from "../tools/functions/style-tools/shadow-properties";
import * as c from "ansi-colors";
import { Thread } from "./thread";
import { getContext } from "../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

export class InteractionEditor {
  thread: Thread;
  constructor(thread: Thread) {
    this.thread = thread;
  }
  editInteractions = traceable(async ({ variants, text }) => {
    // Retrieve context from your custom function, assuming it returns relevant information
    const context = (await getContext(
      text,
      0.7,
      false
    )) as ScoredPineconeRecord[];
    const { content } = context[0].metadata;

    try {
      // Create the message to send to OpenAI
      const messages = [
        {
          role: "system",
          content: `
          You are a property modifier. You have to modify the following css properties in the exact format i provide you. Response in JSON format only,
          The goal is to modify + add the relevant properties not replace. You will need to provide comprehensive when you give me css properties. Dont leave out properties that are needed for the css to work. For example if I ask you to make a hover modification.
  
          only response to me in JSON format. The json format I want always is in variants and the properties are always ['main_hover', 'main_focus']
          """
          {
            "variants": {
              "main_hover": "background-color: red;",
              "main_focus": "border: 1px solid red;",
              }
          }
          """
          Change the following CSS "${variants}" as described: "${text}". Reference CSS: "${content}".`,
        },
        {
          role: "user",
          content: text,
        },
      ];

      // Fetch the modified CSS from OpenAI
      const response = await this.thread.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
      });

      if (response.choices[0] && response.choices[0].message) {
        const jsonResponse = JSON.parse(response.choices[0].message.content);
        console.log(
          "\x1b[35m [INTERACTION-TOOL] - final response: \x1b[35m",
          jsonResponse
        );
        return jsonResponse; // Return the JSON response directly
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (error) {
      console.error("Error processing CSS modification:", error);
      throw new Error("Failed to modify CSS due to an internal error.");
    }
  });
}
