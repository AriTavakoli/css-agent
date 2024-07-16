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
  async editInteractions({
    variants,
    text,
  }: {
    variants: string;
    text: string;
  }) {
    // Retrieve context from your custom function, assuming it returns relevant information
    const context = (await getContext(
      text,
      0.7,
      false
    )) as ScoredPineconeRecord[];
    const { content } = context[0].metadata;

    // Create the message to send to OpenAI
    const messages = [
      {
        role: "system",
        content:
          "You are a interaction property modifier. You have to modify the following css properties in the exact format I provide you" +
          "Only respond in JSON format." +
          "You will need to be comprehensive when you give me css properties." +
          "Don't leave out properties that are needed for the css to work." +
          "You will need to think about what is the best way to solve the user's query and provide the best solution." +
          "Think about it first before you respond." +
          "only response to me in JSON format. The json format I want always is in variants and the properties are always ['main_hover', 'main_focus']" +
          `{
            "variants": {
              "main_hover": "background-color: red;",
              "main_focus": "border: 1px solid red;",
              }
          }
          Change the following CSS that is delimited by triple quotes """${variants}"""
          Follow this command that is delimited by quadruple quotes """"${text}"""".
          Here is reference css in the following brackets <${content}>`,
      },
      {
        role: "user",
        content: text,
      },
    ];

    // Fetch the modified CSS from OpenAI
    const response = await this.thread.openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });
    const result = this.thread.extractResponse(
      response,
      "[INTERACTION-EDITOR]"
    );
    return result;
  }
}
