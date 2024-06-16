import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { END, START, MessageGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";




const calculator = new Calculator();
const tools = [calculator];
const toolNode = new ToolNode<BaseMessage[]>(tools);
const model = new ChatOpenAI({
  temperature: 0,
  // Set streaming to true to enable streaming
  streaming: true,
}).bindTools(tools);

const graph = new MessageGraph()
  .addNode("model", async (state: BaseMessage[]) => {
    const response = await model.invoke(state);
    return [response];
  })
  .addNode("calculator", toolNode)
  .addEdge(START, "model")
  .addEdge("calculator", END);