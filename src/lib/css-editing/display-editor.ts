import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { getContext } from "../../utils/context";
import { logInitChild, logResultsChild } from "../logger";
import { Thread } from "../thread";

export class DisplayEditor {
  thread: Thread;

  constructor(rootThreadInstance: Thread) {
    this.thread = rootThreadInstance;
  }
  async editDisplay({ css, text }: { css: string; text: string }) {
    const context = (await getContext(
      text,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    const metaDetas = context.map((c) => c.metadata);

    const metaDataContent = metaDetas.map((c) => c.content);


    const messages = [
      {
        role: "system",
        content: `
            You are css display editor. You will either modify the element with grid or flex. Depending on the user's query. 
            DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
            Response in JSON format only.
            Example format response in delimited in triple quotes:
            """
            {
              "css": "display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;"
            }
            """

            If I ask you something like bottom left or top right. I want you to modify the current element so that its display flex with justify-content, and align-items that corresponds to the user's query.


            Change the following css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
            Use this metadeta as reference for the properties and format. "${JSON.stringify(
              metaDataContent
            )}".
            `,
      },
      {
        role: "user",
        content: text,
      },
    ];
    logInitChild("DISPLAY-EDITOR", [], "magentaBright");
    console.time(c.magentaBright("[DISPLAY-EDITOR] - execution time : "));

    const response = await this.thread.openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: messages,
      response_format: { type: "json_object" },
    });
    console.timeEnd(c.magentaBright("[DISPLAY-EDITOR] - execution time : "));
    logResultsChild(
      response.choices[0].message?.content,
      "DISPLAY-EDITOR",
      "magentaBright"
    );

    const result = this.thread.extractResponse(response, "[DISPLAY-EDITOR]");
    return result;
  }
}
