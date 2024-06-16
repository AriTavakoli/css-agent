import express from "express";
import OpenAI from "openai";
import editCss from "../../../tools/functions/css-properties";
import { tools } from "../../../tools/tools-index";
import editInteractions from "../../../tools/functions/interaction-properties";
import { wrapOpenAI } from "langsmith/wrappers";
import { traceable } from "langsmith/traceable";
import { gridEditor } from "../../tools/lang-chain";
import { AssistantTool } from "openai/resources/beta/assistants";

const router = express.Router();

const assistantConfig = {
  cssEditor: "asst_v5AJgNIjLh1DzNxWSFA0NNJX",
};

router.post<{}>("/", async (req, res) => {
  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

  console.clear();

  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
    limit: "20",
  });

  const assistantCreator = await new CreateAssistant(openai).createCssEditor();

  console.log(assistantCreator);

  const assistantIds = myAssistants.data.map((assistant) => {
    assistant.name, assistant.id;
  });

  console.log(assistantIds);

  console.log(myAssistants.data);
  res.json({ message: assistantCreator });
});

export default router;

class CreateAssistant {
  openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  async createCssEditor() {
    const assistant = await this.openai.beta.assistants.create({
      instructions: `
      you are a css editor. You have to modify the following css properties in the exact format i provide you. 
      Response in JSON format only. The goal is to modify + add the relevant properties not replace. You will need to provide comprehensive when you give me css properties. 
      Dont leave out properties that are needed for the css to work. You will likely need to use multiple tools to get it done. NEVER provide anything other than css.
`,
      name: "Css Editor",
      model: "gpt-4o",
      response_format: { type: "json_object" },
      description:
        "css assistant that can modify css properties in the exact format provided. only response with modified css properties in JSON format.",
      // tools: [{ type: "function", ...cssTool }],
    });

    return assistant;
  }
}
