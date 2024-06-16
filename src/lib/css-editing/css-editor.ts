import * as c from "ansi-colors";
import { traceable } from "langsmith/traceable";
import { ChatCompletion } from "openai/resources";
import { cssPropertyTools } from "./css-tools-index";
import { editGrid } from "../../tools/functions/style-tools/grid-properties";
import { editShadow } from "../../tools/functions/style-tools/shadow-properties";
import { logInit, logResults } from "../logger";
import { Thread } from "../thread";
import { GridEditor } from "./grid-editor";
import { ShadowEditor } from "./shadow-editor";
import { PositionEditor } from "./position-editor";
import { GradientEditor } from "./gradient-editor";

export class CssEditor {
  thread: Thread;
  gridEditor: GridEditor;
  shadowEditor: ShadowEditor;
  positionEditor: PositionEditor;
  gradientEditor: GradientEditor;
  constructor(thread: Thread) {
    this.thread = thread;
    this.gridEditor = new GridEditor(thread);
    this.shadowEditor = new ShadowEditor(thread);
    this.positionEditor = new PositionEditor(thread);
    this.gradientEditor = new GradientEditor(thread);
  }

  async editCss({ css, text }) {
    const pipeline = traceable(async (user_input) => {
      const res: ChatCompletion =
        await this.thread.openai.chat.completions.create({
          model: "gpt-4o",
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
      return res.choices[0].message?.tool_calls;
    });

    try {
      const response = await pipeline(text);
      const toolCalls = response;

      logInit("CSS-EDITOR", toolCalls, "yellow");
      console.time(c.yellow("[CSS-EDITOR] - execution time : "));

      const results = await Promise.all(
        toolCalls?.map(async (toolCall) => {
          const functionName = toolCall.function.name;

          this.thread.toolsUsed.push(functionName);
          const functionArgs = JSON.parse(toolCall.function.arguments);

          switch (functionName) {
            case "editGrid":
              return this.thread.cssEditor.gridEditor.editGrid({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            case "editShadow":
              return this.thread.cssEditor.shadowEditor.editShadow({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            case "editGradient":
              return this.thread.cssEditor.gradientEditor.editGradient({
                css: functionArgs.css,
                text: functionArgs.text,
              });
            case "editPosition":
              return this.thread.cssEditor.positionEditor.editPosition({
                css: functionArgs.css,
                text: functionArgs.text,
              });
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
