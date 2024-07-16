import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { getContext } from "../../utils/context";
import { logInit, logResults, logResultsChild } from "../logger";
import { Thread } from "../thread";
import { traceable } from "langsmith/traceable";

export class GridEditor {
  thread: Thread;

  constructor(rootThreadInstance: Thread) {
    this.thread = rootThreadInstance;
  }
  editGrid = traceable(
    async ({ css, text }) => {
      const context = (await getContext(
        text,
        0.7,
        false
      )) as ScoredPineconeRecord[];

      const metaDetas = context.map((c) => c.metadata);

      // const metaDataContent = metaDetas.map((c) => c.content);

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

            if the user asks for rows or columns that span. you need to make sure that the template area and the grid template columns and rows are updated accordingly.

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
      logInit("GRID-EDITOR", [], "magentaBright");
      console.time(c.magentaBright("[GRID-EDITOR] - execution time : "));

      const response = await this.thread.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
      });
      console.timeEnd(c.magentaBright("[GRID-EDITOR] - execution time : "));
      logResultsChild(
        response.choices[0].message?.content,
        "GRID-EDITOR",
        "magentaBright"
      );

      const result = this.thread.extractResponse(response, "[GRID-EDITOR]");
      return result;
    },
    {
      name: "editGrid",
      tags: ["editGrid"],
      metadata: {
        tool: "editGrid",
      },
      parent_run_id: "root",
    }
  );
}
