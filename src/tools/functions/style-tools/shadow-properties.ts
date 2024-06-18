import OpenAI from "openai";
import { getContext } from "../../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { Model } from "../../../api/routes/suggestion";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import * as c from "ansi-colors";
import { logResults } from "../../../lib/logger";

export const editShadow = traceable(
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
    // console.log("Shadow:", metaDataContent);

    try {
      const messages = [
        {
          role: "system",
          content: `
        You are a shadow css property modifier that modifies css in my custom format.
        The css I provide you is the properties of the current class that I am editing.
        Only include the shadow properties.
         DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declerations and are only property declarations.
        response in json format only. 
        Example format response in delimmitted in triple quotes:
        """
        {
          "css": "box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);",
        }
        """
        Change the following element's css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
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
      console.log(c.redBright("[SHADOW-EDITOR] - initiated"));
      console.time(c.redBright("[SHADOW-EDITOR] - execution time : "));
      // Fetch the modified CSS from OpenAI
      // Fetch the modified CSS from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
      });
      console.timeEnd(c.redBright("[SHADOW-EDITOR] - execution time : "));

      logResults(
        response.choices[0].message?.content,
        "SHADOW-EDITOR",
        "redBright"
      );
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
    name: "editShadow",
    run_type: "llm",
  }
);
