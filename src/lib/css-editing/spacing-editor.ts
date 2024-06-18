import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { traceable } from "langsmith/traceable";
import { getContext } from "../../utils/context";
import { logInit, logResults } from "../logger";
import { Thread } from "../thread";

export class SpacingEditor {
  thread: Thread;

  constructor(thread: Thread) {
    this.thread = thread;
  }

  async editSpacing({ css, text }) {
    const messages = [
      {
        role: "system",
        content: `
            You are a SPACING css property modifier that modifies css in my custom format.
            The css I provide you is the properties of the current class that I am editing.
            Only include the SPACING properties.
             DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
            response in json format only. 
            Example format response in delimited in triple quotes:
            """
            {
              "css": "margin: 10px; padding: 10px 20px 10px 20px",
            }
            """
            Change the following element's css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
            `,
      },
      {
        role: "user",
        content: text,
      },
    ];
    logInit("SPACING-EDITOR", [], "cyanBright");
    console.time(c.cyanBright("[SPACING-EDITOR] - execution time : "));
    const response = await this.thread.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: { type: "json_object" },
    });
    console.timeEnd(c.cyanBright("[SPACING-EDITOR] - execution time : "));

    logResults(
      response.choices[0].message?.content,
      "SPACING-EDITOR",
      "cyanBright"
    );
    const result = this.thread.extractResponse(response, "[SPACING-EDITOR]");
    return result;
  }
}
