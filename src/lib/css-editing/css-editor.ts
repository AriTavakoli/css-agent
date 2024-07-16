import * as c from "ansi-colors";
import { ChatCompletion } from "openai/resources";
import { logInitChild, logResults } from "../logger";
import { Thread } from "../thread";
import { cssPropertyTools } from "./css-tools-index";
import { GradientEditor } from "./gradient-editor";
import { GridEditor } from "./grid-editor";
import { PositionEditor } from "./position-editor";
import { ShadowEditor } from "./shadow-editor";
import { SpacingEditor } from "./spacing-editor";
import { DisplayEditor } from "./display-editor";
import { traceable } from "langsmith/traceable";
import { TransformEditor } from "./tranform-editor";
export class CssEditor {
  thread: Thread;
  gridEditor: GridEditor;
  shadowEditor: ShadowEditor;
  positionEditor: PositionEditor;
  gradientEditor: GradientEditor;
  spacingEditor: SpacingEditor;
  displayEditor: DisplayEditor;
  tranformEditor: TransformEditor;
  constructor(rootThreadInstance: Thread) {
    this.thread = rootThreadInstance;
    this.gridEditor = new GridEditor(rootThreadInstance);
    this.shadowEditor = new ShadowEditor(rootThreadInstance);
    this.positionEditor = new PositionEditor(rootThreadInstance);
    this.gradientEditor = new GradientEditor(rootThreadInstance);
    this.spacingEditor = new SpacingEditor(rootThreadInstance);
    this.displayEditor = new DisplayEditor(rootThreadInstance);
    this.tranformEditor = new TransformEditor(rootThreadInstance);
  }

  async editCss({ css, text }: { css: string; text: string }) {
    const invokeLLM = traceable(
      async (user_input) => {
        const res: ChatCompletion =
          await this.thread.openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
              {
                role: "system",
                content: `You are a css editor assistant. 
              You will need take in the user's query and determine the correct tool to use. You need to make sure you are choosing the right tool depending on the type of properties the user is asking to change. 
              Determine what to do with the following css: ${css} by following command: ${text}
              Respond in JSON format only.
              `,
              },
              {
                role: "user",
                content: `Determine what to do with the following css: ${css} by following command: ${text}`,
              },
            ],
            temperature: 0.1,
            tools: cssPropertyTools,
            response_format: { type: "json_object" },
            tool_choice: "required",
          });
        // childRun.end({ result: res.choices[0].message?.tool_calls });
        // await childRun.postRun();
        return res.choices[0].message?.tool_calls;
      },
      {
        name: "invokeLLM",
        tags: ["invokeLLM"],
        metadata: {
          tool: "invokeLLM",
        },
      }
    );

    try {
      const response = await invokeLLM(text);
      const toolCalls = response;

      logInitChild("CSS-EDITOR", toolCalls, "yellow");
      console.time(c.yellow("[CSS-EDITOR] - execution time : "));

      const results = await Promise.all(
        toolCalls?.map(async (toolCall) => {
          const functionName = toolCall.function.name;

          this.thread.toolsUsed.push(functionName);
          const functionArgs = JSON.parse(toolCall.function.arguments);

          switch (functionName) {
            case "editGrid":
              const gridResult =
                await this.thread.cssEditor.gridEditor.editGrid({
                  css: functionArgs.css,
                  text: functionArgs.text,
                });

              return gridResult;
            case "editShadow":
              const shadowResult =
                await this.thread.cssEditor.shadowEditor.editShadow({
                  css: functionArgs.css,
                  text: functionArgs.text,
                });
              return shadowResult;
            case "editGradient":
              const gradientResult =
                await this.thread.cssEditor.gradientEditor.editGradient({
                  css: functionArgs.css,
                  text: functionArgs.text,
                });

              return gradientResult;
            case "editPosition":
              const positionResult =
                await this.thread.cssEditor.positionEditor.editPosition({
                  css: functionArgs.css,
                  text: functionArgs.text,
                });

              return positionResult;

            case "editSpacing":
              const spacingResult =
                await this.thread.cssEditor.spacingEditor.editSpacing({
                  css: functionArgs.css,
                  text: functionArgs.text,
                });

              return spacingResult;
            default:
              throw new Error(`Function ${functionName} not found.`);
          }
        })
      );
      console.timeEnd(c.yellow("[CSS-EDITOR] - execution time : "));
      logResults(results, "CSS-EDITOR", "yellow");

      return results;
    } catch (error) {
      console.error("Error processing CSS edits:", error);
      return []; // Handle error or return an error state as appropriate
    }
  }
}
