import OpenAI from "openai";
import { getContext } from "../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { Model } from "../../api/routes/suggestion";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";

export default async function multiply(css, text) {
  const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

  // Retrieve context from your custom function, assuming it returns relevant information
  const context = (await getContext(
    text,
    0.7,
    false
  )) as ScoredPineconeRecord[];

  const metaDetas = context.map((c) => c.metadata);

  // console.log("Metadata:", metaDetas);

  // console.log(context, "context");
  // console.log(css, "css");

  // const { content } = context[0].metadata;

  try {
    // Create the message to send to OpenAI
    const messages = [
      {
        role: "system",
        content: `
       mulityple the following ${css} by ${text} and output the result in JSON format.
        `,
      },
      {
        role: "user",
        content: text,
      },
    ];

    // Fetch the modified CSS from OpenAI
    const pipeline = traceable(async (messages) => {
      const response = await openai.chat.completions.create({
        model: Model.gpt3,
        messages: messages,
        response_format: { type: "json_object" },
      });
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      return jsonResponse;
    });

    const response = await pipeline(messages);
    // Assuming the response is correctly formatted as JSON
    return response;
  } catch (error) {
    console.error("Error processing CSS modification:", error);
    throw new Error("Failed to modify CSS due to an internal error.");
  }
}
