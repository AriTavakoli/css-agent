import {
  RunnableLambda,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { ChatOpenAI } from "@langchain/openai";
import express from "express";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { boxShadowEditor, combineCss, gridEditor } from "../tools/lang-chain";
const router = express.Router();

router.post<{}>("/", async (req, res) => {
  const tools = [gridEditor, boxShadowEditor, combineCss];
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
  const chain = RunnableSequence.from([
    modelWithTools,
    new JsonOutputToolsParser(),
    // .map() allows us to apply a function for each item in a list of inputs.
    // Required because the model can call multiple tools at once.
    callSelectedTool.map(),
  ]);

  const result = await chain.invoke(
    "I want grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;s and a box shadow then return all the changes made together"
  );

  const mappedResult = result.map((x) => x.output);

  // const

  res.send(result);
});

export default router;
