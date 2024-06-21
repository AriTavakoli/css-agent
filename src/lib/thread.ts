import * as c from "ansi-colors";
import { RunTree } from "langsmith";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import { CssEditor } from "./css-editing/css-editor";
import { cssPropertyTools } from "./css-editing/css-tools-index";
import { InteractionEditor } from "./interaction-editor";
import { logInit, logResults } from "./logger";
import { traceable } from "langsmith/traceable";
export class Thread {
  openai: OpenAI;
  processors: Record<string, Function>;
  userPayload: {
    currentStyleBlock: any;
    currentElement: any;
    inputValue: string;
    minimalTreeStructure: any;
  };
  toolsUsed: string[] = [];
  pipeline: RunTree;

  cssEditor: CssEditor;
  interactionEditor: InteractionEditor;
  tools = {
    cssPropertyTools,
  };
  runTree: RunTree;
  createCompletion: Function;

  runResult = {};

  constructor({ openai, userPayload }: { openai: OpenAI; userPayload: any }) {
    this.openai = openai;
    this.cssEditor = new CssEditor(this);
    this.interactionEditor = new InteractionEditor(this);
    this.userPayload = userPayload;
  }

  invokeLLM = async (user_input: string) => {
    console.time(c.italic(user_input));

    const toolCalls = await this.chatRequest(user_input);

    logInit("DELEGATOR", toolCalls, "blueBright");
    const results = await Promise.all(
      toolCalls?.map(async (toolCall) => {
        const functionName = toolCall.function.name;

        this.toolsUsed.push(functionName);
        const functionArgs = JSON.parse(toolCall.function.arguments);

        switch (functionName) {
          case "editTransform":
            const tranformResult =
              await this.cssEditor.tranformEditor.editTransform({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            return tranformResult;

          case "editInteractions":
            const interactionResult =
              await this.interactionEditor.editInteractions({
                variants: functionArgs.variants,
                text: functionArgs.text,
              });
            return interactionResult;

          case "editDisplay":
            const displayResult =
              await this.cssEditor.displayEditor.editDisplay({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            return displayResult;
          case "editGrid":
            const gridResult = await this.cssEditor.gridEditor.editGrid({
              css: functionArgs.css,
              text: functionArgs.text,
            });
            return gridResult;
          case "editShadow":
            const shadowResult = await this.cssEditor.shadowEditor.editShadow({
              css: functionArgs.css,
              text: functionArgs.text,
            });
            return shadowResult;
          case "editGradient":
            const gradientResult =
              await this.cssEditor.gradientEditor.editGradient({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            return gradientResult;
          case "editPosition":
            const positionResult =
              await this.cssEditor.positionEditor.editPosition({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            return positionResult;
          case "editSpacing":
            const spacingResult =
              await this.cssEditor.spacingEditor.editSpacing({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            return spacingResult;
          default:
            throw new Error(`Function ${functionName} not found.`);
        }
      })
    );

    return results;
  };

  chatRequest = traceable(
    async (user_input: string) => {
      console.log(c.bgRed("INITIATING CHAT REQUEST"));
      const res: ChatCompletion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
          You are a css editor assistant. You only edit properties that the user asks for. The user provides many properties that aren't related to their query. 
          Its very important that you properly distinguish between the properties that are related to the user's query and the ones that are not. 
           `,
          },
          {
            role: "user",
            content: constructQuery(
              user_input,
              this.userPayload.currentStyleBlock.styleLess,
              this.userPayload.currentStyleBlock.variants
            ),
          },
        ],
        tools: this.tools.cssPropertyTools,
        tool_choice: "required",
      });
      return res.choices[0].message?.tool_calls;
    },
    {
      name: "INIT",
      run_type: "llm",
    }
  );

  finalPipeline = traceable(
    async (results: any[]) => {
      logInit("APPLY-STYLES", [], "greenBright");
      console.time(c.greenBright("[APPLY-STYLES] - execution time : "));

      const res: ChatCompletion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content:
              "You are a css editor assistant. You will take the newly modified css and then apply the changes to the old css." +
              "Apply the changes by following this following this delimited in triple quotes :" +
              `"""" ${this.userPayload.inputValue} """".` +
              `Here is the new CSS that I want you to apply in the following quadruple quotes:  
            """"${this.userPayload.currentStyleBlock.styleLess} """"` +
              "I want you to apply the changes to the old css with this css which is surrounded by 2 brackets" +
              `  {{ """${JSON.stringify(results)}""". }}

          There are only two keys you are allowed to provide me. The css key and the variants key. No nested objects are allowed.
          Respond in json format only. All of the properties should be in either the css or variants object. There can ONLY be a single css object and a single variants object.
          It's very important that you recognize that sometimes there will be overlap in the requests so you need to complete all of the requests.
          Make sure you take a second to think about what the best strategy is to complete the users query. 
          Take all the new properties and combine the in the following format in triple quotes. Only use this as an example for format.
          """{
              css :"{new css properties}",
            }""".
             `,
          },
        ],
      });

      console.timeEnd(c.greenBright("[APPLY-STYLES] - execution time : "));
      logResults(
        res.choices[0].message?.content,
        "APPLY-STYLES",
        "greenBright"
      );

      console.log("\x1b[36mTools used: \x1b[36m", this.toolsUsed);

      return res.choices[0].message?.content;
    },
    {
      name: "finalPipeline",
      parent_run_id: "root",
      metadata: {
        tool: "finalPipeline",
      },
    }
  );

  extractResponse(response: any, functionName: string) {
    if (response.choices[0] && response.choices[0].message) {
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      return jsonResponse;
    } else {
      throw new Error(`No response from ${functionName}`);
    }
  }
}

function constructQuery(text: string, css: string, variants: string) {
  let message = `I want you to take this css which is in the double brackets {{ ${css} }} and then modify it using the following text in double brackets: {{ ${text} }}.`;
  return message;
}
