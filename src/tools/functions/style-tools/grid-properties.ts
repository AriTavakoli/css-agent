import OpenAI from "openai";
import { getContext } from "../../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { FunctionToolCall } from "openai/resources/beta/threads/runs/steps";
import { ChatCompletion } from "openai/resources";

export const editGrid = traceable(
  async ({ css, text }) => {
    const openai = wrapOpenAI(
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    );
    // Retrieve context from your custom function, assuming it returns relevant information
    const context = (await getContext(
      text,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    const metaDetas = context.map((c) => c.metadata);

    const metaDataContent = metaDetas.map((c) => c.content);

    try {
      // Create the message to send to OpenAI
      const messages = [
        {
          role: "system",
          content: `
        You are a css grid property modifier that modifies css in my custom format.
        Only include the grid properties.
        DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
        Response in JSON format only.
        Example format response in delimited in triple quotes:
        """
        {
          "css": "display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;"
        }
        """
        Change the following grid css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
        Use this metadeta as reference for the properties and format. "${JSON.stringify(
          metaDetas
        )}".
        `,
        },
        {
          role: "user",
          content: text,
        },
      ];
      console.log(c.magentaBright("[GRID-EDITOR] - initiated"));
      console.time(c.magentaBright("[GRID-EDITOR] - execution time : "));

      // Fetch the modified CSS from OpenAI
      // Fetch the modified CSS from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
      });
      console.timeEnd(c.magentaBright("[GRID-EDITOR] - execution time : "));
      console.log(" ");
      console.log(c.magentaBright("-------- [GRID-EDITOR] ---------"));
      console.log(" ");
      console.log(response.choices[0].message.content);
      console.log(" ");
      console.log(c.magentaBright("-------- [GRID-EDITOR] ---------"));
      console.log(" ");
      // Assuming the response is correctly formatted as JSON
      if (response.choices[0] && response.choices[0].message) {
        const jsonResponse = JSON.parse(response.choices[0].message.content);
        return jsonResponse; // Return the JSON response directly
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (error) {
      console.error("Error processing CSS modification:", error);
      throw new Error("Failed to modify CSS due to an internal error.");
    }
  },
  {
    name: "editGrid",
    run_type: "llm",
  }
);
