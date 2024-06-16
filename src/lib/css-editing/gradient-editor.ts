import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { traceable } from "langsmith/traceable";
import { getContext } from "../../utils/context";
import { logInit, logResults } from "../logger";
import { Thread } from "../thread";

export class GradientEditor {
  thread: Thread;

  constructor(thread: Thread) {
    this.thread = thread;
  }

  editGradient = traceable(
    async ({ css, text }) => {
      const context = (await getContext(
        text,
        0.7,
        false
      )) as ScoredPineconeRecord[];

      // const metaDetas = context.map((c) => c.metadata);

      // const metaDataContent = metaDetas.map((c) => c.content);

      // console.log("GRADIENT:", metaDataContent);

      const messages = [
        {
          role: "system",
          content: `
            You are a GRADIENT css property modifier that modifies css in my custom format.
            The css I provide you is the properties of the current class that I am editing.
            Only include the GRADIENT properties.
             DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
            response in json format only. 
            Example format response in delimmitted in triple quotes:
            """
            {
              "css": "display: flex; justify-content: center; align-items: center;",
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
      logInit("GRADIENT-EDITOR", [], "cyanBright");
      console.time(c.cyanBright("[GRADIENT-EDITOR] - execution time : "));
      const response = await this.thread.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        response_format: { type: "json_object" },
      });
      console.timeEnd(c.cyanBright("[GRADIENT-EDITOR] - execution time : "));

      logResults(
        response.choices[0].message?.content,
        "GRADIENT-EDITOR",
        "cyanBright"
      );
      // Assuming the response is correctly formatted as JSON
      const result = this.thread.extractResponse(response, "[GRADIENT-EDITOR]");
      return result;
    },
    {
      name: "editGRADIENT",
      run_type: "tool",
    }
  );
}
