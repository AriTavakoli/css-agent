import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getContext } from "../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

const gridEditor = new DynamicStructuredTool({
  name: "gridEditor",
  description:
    "you are an expert at editing grid layouts. I want you to take the user query and edit the css and only return the css changed",
  schema: z.object({
    userQuery: z.string(),
  }),
  func: async ({ userQuery }: { userQuery: string }) => {
    return `${userQuery}`;
  },
});
const boxShadowEditor = new DynamicStructuredTool({
  name: "boxShadowEditor",
  description:
    "you are an expert at editing box shadows. I want you to take the user query and edit the css and only return the css changed",
  schema: z.object({
    userQuery: z.string(),
  }),
  func: async ({ userQuery }: { userQuery: string }) => {


    const context = (await getContext(
      userQuery,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    console.log(context)

    return `${userQuery}`;
  },
});

const combineCss = new DynamicStructuredTool({
  name: "combineCss",
  description:
    "you are an expert at combining css together. I want you to take the user query and combine the css and only return the css changed",
  schema: z.object({
    userQuery: z.string(),
  }),
  func: async ({ userQuery }: { userQuery: string }) => {
    const context = (await getContext(
      userQuery,
      0.7,
      false
    )) as ScoredPineconeRecord[];

    console.log(context)

    return `${userQuery}`;
  },
});

export { gridEditor, boxShadowEditor, combineCss };
