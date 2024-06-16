import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  END,
  MessageGraph,
  START,
  StateGraph,
  StateGraphArgs,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import express from "express";
import { createSupervisor } from "../../agent-utils/agent-supervisor";
import { createAgent } from "../../agent-utils/create-agent";
import { gridEditor } from "../tools/lang-chain";
import { RunnableConfig } from "@langchain/core/runnables";

interface AgentStateChannels {
  messages: BaseMessage[];
  // The agent node that last performed work
  next: string;
}

const members = ["gridEditor"];

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
const agentStateChannels: StateGraphArgs<AgentStateChannels>["channels"] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
  next: {
    value: (css?: string) => css ?? END,
    default: () => END,
  },
};

const router = express.Router();

router.post<{}>("/", async (req, res) => {
  const supervisorChain = await createSupervisor();

  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  });

  const gridAgent = await createAgent(
    llm,
    [gridEditor],
    "you are a grid editor for css."
  );

  const gridNode = async (
    state: AgentStateChannels,
    config?: RunnableConfig
  ) => {
    const result = await gridAgent.invoke(state, config);
    return {
      messages: [
        new HumanMessage({ content: result.output, name: "Grid Editor" }),
      ],
    };
  };

  const workflow = new StateGraph<AgentStateChannels, unknown, string>({
    channels: agentStateChannels,
  });

  workflow
    .addNode("supervisor", supervisorChain)
    .addNode("gridEditor", gridNode);

  members.forEach((member) => {
    workflow.addEdge(member, "supervisor");
  });

  workflow.addConditionalEdges("supervisor", (x: AgentStateChannels) => x.next);
  console.log("UOOOOO", workflow);
  workflow.addEdge(START, "supervisor");
  const graph = workflow.compile();

  let streamResults = graph.stream(
    {
      messages: [
        new HumanMessage({
          content:
            "make this grid have 2 cols: display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; gap: 10px; background-color: lightgray; box-shadow: 0 4px 24px 0 hsla(214.83870967741936, 17.32%, 64.90%, 0.08);",
        }),
      ],
    },
    { recursionLimit: 100 }
  );

  for await (const output of await streamResults) {
    if (!output?.__end__) {
      console.log(output);
      console.log("----");
    }
  }

  res.send("done");
});

export default router;
