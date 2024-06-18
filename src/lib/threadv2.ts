import * as c from "ansi-colors";
import { traceable } from "langsmith/traceable";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import { CssEditor } from "./css-editing/css-editor";
import { InteractionEditor } from "./interaction-editor";
import { logInit, logResults } from "./logger";
import { RunTree } from "langsmith";
import EventEmitter from "events";
import { GridEditor } from "./css-editing/grid-editor";
import { ShadowEditor } from "./css-editing/shadow-editor";
import { PositionEditor } from "./css-editing/position-editor";
import { GradientEditor } from "./css-editing/gradient-editor";
import { SpacingEditor } from "./css-editing/spacing-editor";

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
  gridEditor: GridEditor;
  shadowEditor: ShadowEditor;
  positionEditor: PositionEditor;
  gradientEditor: GradientEditor;
  spacingEditor: SpacingEditor;

  observer: Observer;
  cssEditor: CssEditor;
  interactionEditor: InteractionEditor;

  constructor({ openai, userPayload }: { openai: OpenAI; userPayload: any }) {
    this.openai = openai;
    // this.cssEditor = new CssEditor(this);
    // this.interactionEditor = new InteractionEditor(this);
    this.userPayload = userPayload;
    this.observer = new Observer();
    this.gridEditor = new GridEditor(this);
    this.shadowEditor = new ShadowEditor(this);
    this.positionEditor = new PositionEditor(this);
    this.gradientEditor = new GradientEditor(this);
    this.spacingEditor = new SpacingEditor(this);
  }

  finalPipeline = async (results: any[]) => {
    logInit("APPLY-STYLES", [], "greenBright");
    console.time(c.greenBright("[APPLY-STYLES] - execution time : "));

    this.observer.eventEmitter.emit("functionCall", {
      functionName: "finalPipeline",
      status: "start",
    });

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
    logResults(res.choices[0].message?.content, "APPLY-STYLES", "greenBright");

    console.log("\x1b[36mTools used: \x1b[36m", this.toolsUsed);
    this.observer.eventEmitter.emit("functionComplete", {
      functionName: "finalPipeline",
      status: "complete",
    });

    this.observer.display();

    return res.choices[0].message?.content;
  };

  extractResponse(response: any, functionName: string) {
    if (response.choices[0] && response.choices[0].message) {
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      return jsonResponse;
    } else {
      throw new Error(`No response from ${functionName}`);
    }
  }
}

class Node {
  name: string;
  children: Node[];
  parent: Node | null;
  status: string;
  startTime: Date;
  endTime?: Date;
  error?: any;

  constructor(name: string, parent: Node | null = null) {
    this.name = name;
    this.parent = parent;
    this.children = [];
    this.status = "pending";
    this.startTime = new Date();
  }

  addChild(node: Node) {
    node.parent = this;
    this.children.push(node);
  }

  complete() {
    this.status = "completed";
    this.endTime = new Date();
  }

  fail(error: any) {
    this.status = "failed";
    this.endTime = new Date();
    this.error = error;
  }
}

class Observer {
  root: Node;
  currentNode: Node;
  eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.root = new Node("root");
    this.currentNode = this.root;
    this.setupListeners();
  }
  setupListeners() {
    this.eventEmitter.on("functionCall", (data) => {
      this.handleFunctionCall(data);
    });

    this.eventEmitter.on("functionComplete", (data) => {
      this.handleFunctionComplete(data);
      this.updateRootStatus();
    });

    this.eventEmitter.on("functionError", (data) => {
      this.handleFunctionError(data);
      this.updateRootStatus();
    });
  }

  handleFunctionCall(data) {
    const newNode = new Node(data.functionName, this.currentNode);
    this.currentNode.addChild(newNode);
    this.currentNode = newNode; // Move down to the new node
  }

  handleFunctionComplete(data) {
    if (this.currentNode.name === data.functionName) {
      this.currentNode.complete();
      if (this.currentNode.parent) {
        this.currentNode = this.currentNode.parent; // Move up to the parent node
      }
    }
  }

  updateRootStatus() {
    if (this.root.children.every((child) => child.status === "completed")) {
      this.root.complete();
    } else if (this.root.children.some((child) => child.status === "failed")) {
      this.root.fail("One or more child nodes failed.");
    }
  }

  handleFunctionError(data) {
    if (this.currentNode.name === data.functionName) {
      this.currentNode.fail(data.error);
      if (this.currentNode.parent) {
        this.currentNode = this.currentNode.parent; // Move up to the parent node
      }
    }
  }
  display(node = this.root, level = 1, prefix = "") {
    const isLastChild =
      node === node.parent?.children[node.parent.children.length - 1];
    const connector = isLastChild ? "    -- " : "   |-- ";
    const nextPrefix = isLastChild ? "       " : "   |   ";

    let statusSymbol;
    if (node.status === "completed") {
      statusSymbol = "✓";
    } else if (node.status === "failed") {
      statusSymbol = "X";
    } else {
      statusSymbol = "?"; // Placeholder for pending or unspecified statuses
    }

    console.log(`${prefix}${connector}${node.name} (${statusSymbol})`);
    console.log(`${prefix}${nextPrefix}`);

    node.children.forEach((child, index) => {
      this.display(child, level + 1, prefix + nextPrefix);
    });
  }
}
