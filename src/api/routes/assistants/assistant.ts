import express from "express";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import OpenAI from "openai";
import {
  ThreadCreateParams,
  Threads,
} from "openai/resources/beta/threads/threads";
import { tools } from "../../../tools/tools-index";

import EventEmitter from "events";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";
import { Runs } from "openai/resources/beta/threads/runs/runs";
import editCss from "../../../tools/functions/css-properties";
import editInteractions from "../../../tools/functions/interaction-properties";
const router = express.Router();

const assistantConfig = {
  cssEditorTurbo: "asst_t6eD4ee0cZ65sRdqVqUatspq",
};

const query = {
  css: "give me a 3 column grid and only response in JSON format. here is the css { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }",
  interaction: "then give me a hover effect to the main class",
};

router.post<{}>("/", async (req, res) => {
  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

  console.clear();
  const {
    currentStyleBlock,
    currentElement,
    inputValue: text,
    minimalTreeStructure,
  } = req.body;

  // console.log(text);
  // console.log(currentStyleBlock);

  function constructQuery(text: string, css: string) {
    return `I want you to take this css which is in the double brackets {{ ${css} }}  and then modify it using the following text in double brackets: {{ ${text} }}`;
  }

  console.log(constructQuery(text, currentStyleBlock.styleLess));

  const messages: ThreadCreateParams.Message[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: constructQuery(text, currentStyleBlock.styleLess),
        },
      ],
    },
  ];

  const thread = await new Thread(openai, messages).createThread();

  await thread.initializeRun(assistantConfig.cssEditorTurbo);
  const msg = await thread.listMessages();

  console.log(msg[0])
  const css = JSON.parse(msg[0].text.value);

  console.log(css);
  res.json({ ...css });
  // await thread.deleteThread();
});

export default router;

export class Thread {
  messages: ThreadCreateParams.Message[];
  thread: Threads.Thread;
  openai: OpenAI;
  runManifest: Record<string, Threads.Run> = {};
  currentStatus: AssistantStreamEvent;
  currentRuns: AssistantStreamEvent[] = [];
  availableFunctions = {
    editCss,
    editInteractions,
  };
  eventHandler: EventHandler;

  constructor(openai: OpenAI, messages: ThreadCreateParams.Message[]) {
    this.messages = messages;
    this.openai = openai;
    this.eventHandler = new EventHandler(this.openai);
    this.eventHandler.on(
      "event",
      this.eventHandler.onEvent.bind(this.eventHandler)
    );
  }

  async createThread() {
    const thread = await this.openai.beta.threads.create({
      messages: this.messages,
    });
    this.thread = thread;
    return this;
  }

  async fetchRuns() {
    const runs = await this.openai.beta.threads.runs.list(this.thread.id);
    return runs;
  }

  initializeRun = traceable(async (assistantId: string) => {
    const stream = await this.openai.beta.threads.runs.create(this.thread.id, {
      assistant_id: assistantId,
      tools: tools,
      model: "gpt-3.5-turbo-0125",
      parallel_tool_calls: true,
      response_format: { type: "json_object" },
      tool_choice: "required",
      stream: true,
    });
    for await (const event of stream) {
      switch (event.event) {
        case "thread.run.requires_action":
          const runId = event.data.id;
          await this.eventHandler.handleRequiresAction(
            event.data,
            runId,
            this.thread.id
          );

        case "thread.run.completed":
          console.log("Run completed");
          return "completed";
        // await this.listMessages();
        case "error":
          break;
      }
    }
    return stream;
  });

  async createMessage(input: string) {
    const threadMessages = await this.openai.beta.threads.messages.create(
      this.thread.id,
      {
        role: "user",
        content: input,
      }
    );
  }
  async listMessages() {
    const threadMessages = await this.openai.beta.threads.messages.list(
      this.thread.id
    );
    // console.log(threadMessages.data);
    const messagesContent = threadMessages.data.map((message) => {
      switch (message.content[0].type) {
        case "text":
          return message.content[0];
        case "image_file":
          return message.content[0].image_file;
        case "image_url":
          return message.content[0].image_url;
      }
    });
    // console.log(messagesContent);
    return messagesContent;
  }

  async deleteThread() {
    const response = await this.openai.beta.threads.del(this.thread.id);
    return response;
  }
}

class EventHandler extends EventEmitter {
  openai: OpenAI;
  constructor(openai: OpenAI) {
    super();
    this.openai = openai;
  }
  async onEvent(event: AssistantStreamEvent) {
    try {
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === "thread.run.requires_action") {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id
        );
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  }
  async handleRequiresAction(
    data: AssistantStreamEvent.ThreadRunRequiresAction["data"],
    runId: string,
    threadId: string
  ) {
    try {
      const toolCalls = data.required_action.submit_tool_outputs.tool_calls.map(
        (toolcall) => toolcall.function.name
      );
      console.log("\x1b[31m%s\x1b[0m", "toolCalls");
      console.log(toolCalls);

      const toolOutputs = async () => {
        const promises =
          data.required_action.submit_tool_outputs.tool_calls.map(
            async (toolCall) => {
              const functionName = toolCall.function.name;
              const availableFunctions = {
                editCss: editCss,
                editInteractions: editInteractions,
              };
              const functionToCall = availableFunctions[functionName];
              const functionArgs = JSON.parse(toolCall.function.arguments);

              switch (functionName) {
                case "editCss":
                  console.log("\x1b[31m%s\x1b[0m", "editCSS called");
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(
                      await functionToCall({
                        css: functionArgs.css,
                        text: functionArgs.text,
                      })
                    ),
                  };
                case "editInteractions":
                  console.log("\x1b[31m%s\x1b[0m", "editInteractions called");
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(
                      await functionToCall({
                        variants: functionArgs.variants,
                        text: functionArgs.text,
                      })
                    ),
                  };
                default:
                  throw new Error(`Function ${functionName} not found.`);
              }
            }
          );
        return Promise.all(promises);
      };

      const result = await toolOutputs();
      await this.submitToolOutputs(result, runId, threadId);
    } catch (error) {
      console.error("Error processing required action:", error);
    }
  }

  submitToolOutputs = async (
    toolOutputs: Runs.RunSubmitToolOutputsParams.ToolOutput[],
    runId: Runs.Run["id"],
    threadId: Threads.Thread["id"]
  ) => {
    try {
      // Use the submitToolOutputsStream helper
      const stream = this.openai.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs }
      );
      for await (const event of stream) {
        this.emit("event", event);
      }
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
    }
  };
}
