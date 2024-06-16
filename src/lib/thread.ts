import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { cssPropertyTools } from "./css-editing/css-tools-index";
import { logInit, logResults } from "./logResults";
import { editGrid } from "../tools/functions/style-tools/grid-properties";
import { editShadow } from "../tools/functions/style-tools/shadow-properties";
import * as c from "ansi-colors";
import { InteractionEditor } from "./interaction-editor";
import { CssEditor } from "./css-editing/css-editor";

export class Thread {
  openai: OpenAI;
  processors: Record<string, Function>;
  userPayload: {
    currentStyleBlock: any;
    currentElement: any;
    inputValue: string;
    minimalTreeStructure: any;
  };

  cssEditor: CssEditor;
  interactionEditor: InteractionEditor;

  constructor({ openai, userPayload }: { openai: OpenAI; userPayload: any }) {
    this.openai = openai;
    this.cssEditor = new CssEditor(this);
    this.interactionEditor = new InteractionEditor(this);
    this.userPayload = userPayload;
  }

  finalPipeline = traceable(
    async (results) => {
      logInit("TRANSPILER", [], "greenBright");
      console.log(c.greenBright("[TRANSPILER] - initiated"));
      console.time(c.greenBright("[TRANSPILER] - execution time : "));
      const res: ChatCompletion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `You are a css editor assistant. You will take the newly modified css and then apply the changes to the old css. 
          Apply the changes by following this following command : """" ${
            this.userPayload.inputValue
          } """".
          
          Here is the current CSS in 4 quotes """"${
            this.userPayload.currentStyleBlock.styleLess
          } """".
          
          I want you to apply the changes to the old css with this css which is surrounded by 2 brackets 
          
           {{ """${JSON.stringify(results)}""". }}


          Respond in json format only. All of the properties should be in either the css or variants object. 
          take all the new properties and combine the in the following format in triple quotes. Only use this as an example for format, not content  
          """{
              css : "{new css properties}",
            }""".
             `,
          },
        ],
      });

      console.timeEnd(c.greenBright("[TRANSPILER] - execution time : "));
      logResults(res.choices[0].message?.content, "TRANSPILER", "greenBright");

      return res.choices[0].message?.content;
    },
    {
      name: "TRANSPILER",
      run_type: "llm",
    }
  );
}
