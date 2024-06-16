import { Calculator } from "@langchain/community/tools/calculator";
import { BaseMessage } from "@langchain/core/messages";
import { END, MessageGraph, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import express from "express";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { gridEditor, boxShadowEditor } from "../tools/lang-chain";
import { StateGraph } from "@langchain/langgraph";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import {
  RunnableLambda,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
const router = express.Router();

router.post<{}>("/", async (req, res) => {
  const tools = [gridEditor, boxShadowEditor];
  const toolNode = new ToolNode<BaseMessage[]>(tools);
  const model = new ChatOpenAI({
    temperature: 0,
    // Set streaming to true to enable streaming
    streaming: true,
  }).bindTools(tools);

  const toolsMap: Record<string, any> = {
    gridEditor: gridEditor,
    boxShadowEditor: boxShadowEditor,
  };

  const modelWithTools = model.bind({
    tools: tools.map(convertToOpenAITool),
  });

  const callSelectedTool = RunnableLambda.from(
    (toolInvocation: Record<string, any>) => {
      const selectedTool = toolsMap[toolInvocation.type];
      if (!selectedTool) {
        throw new Error(
          `No matching tool available for requested type "${toolInvocation.type}".`
        );
      }
      const toolCallChain = RunnableSequence.from([
        (toolInvocation) => toolInvocation.args,
        selectedTool,
      ]);
      // We use `RunnablePassthrough.assign` here to return the intermediate `toolInvocation` params
      // as well, but you can omit if you only care about the answer.
      return RunnablePassthrough.assign({
        output: toolCallChain,
      });
    }
  );

  const graph = new MessageGraph()
    .addNode("model", async (state: BaseMessage[]) => {
      const response = await model.invoke(state);
      return [response];
    })
    .addNode("gridEditor", toolNode)
    .addNode("boxShadowEditor", toolNode)
    .addEdge(START, "model")
    .addEdge("gridEditor", END)
    .addEdge("boxShadowEditor", END);

  const router = (state: BaseMessage[]) => {
    console.log("Being Called");
    const toolCalls = (state[state.length - 1] as AIMessage).tool_calls ?? [];
    const toolCallNames = toolCalls.map((toolCall) => toolCall.name);
    if (toolCalls.length) {
      return toolCalls[0].name;
    } else {
      return "end";
    }
  };

  graph.addConditionalEdges("model", router, {
    gridEditor: "gridEditor",
    boxShadowEditor: "boxShadowEditor",
    end: END,
  });

  const runnable = graph.compile();
  const cssEditorResponse = await runnable.invoke(
    new HumanMessage(
      "give this a box shadow and change the grid: display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; gap: 10px; background-color: lightgray; box-shadow: 0 4px 24px 0 hsla(214.83870967741936, 17.32%, 64.90%, 0.08);"
    )
  );

  res.send(cssEditorResponse);
});

export default router;
