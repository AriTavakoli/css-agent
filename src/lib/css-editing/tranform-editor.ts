import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import * as c from "ansi-colors";
import { getContext } from "../../utils/context";
import { logInitChild, logResultsChild } from "../logger";
import { Thread } from "../thread";

export class TransformEditor {
  thread: Thread;

  constructor(rootThreadInstance: Thread) {
    this.thread = rootThreadInstance;
  }
  async editTransform({ css, text }: { css: string; text: string }) {
    const context = (await getContext(
      text,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    // const metaDetas = context.map((c) => c.metadata);

    // const metaDataContent = metaDetas.map((c) => c.content);

    const messages = [
      {
        role: "system",
        content: `
            You are css transform editor. You will need to modify the elements with the correct transform properties.
            DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
            Response in JSON format only.
            Example format response in delimited in triple quotes:
            """
            {
              "css": "transform: rotate(45deg) scale(1.5) translateX(10px) translateY(10px) skewX(10deg) skewY(10deg);"
            }
            """


            Change the following css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
          
            `,
      },
      {
        role: "user",
        content: text,
      },
    ];
    logInitChild("TRANSFORM-EDITOR", [], "magentaBright");
    console.time(c.magentaBright("[TRANSFORM-EDITOR] - execution time : "));

    const response = await this.thread.openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: messages,
      response_format: { type: "json_object" },
    });
    console.timeEnd(c.magentaBright("[TRANSFORM-EDITOR] - execution time : "));
    logResultsChild(
      response.choices[0].message?.content,
      "TRANSFORM-EDITOR",
      "magentaBright"
    );

    const result = this.thread.extractResponse(response, "[TRANSFORM-EDITOR]");
    return result;
  }
}
