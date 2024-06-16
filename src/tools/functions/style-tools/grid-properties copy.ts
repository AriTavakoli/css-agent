import OpenAI from "openai";
import { getContext } from "../../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

export default async function editGrid({ css, text }) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Retrieve context from your custom function, assuming it returns relevant information
  const context = (await getContext(
    text,
    0.7,
    false
  )) as ScoredPineconeRecord[];

  const metaDetas = context.map((c) => c.metadata);

  const metaDataContent = metaDetas.map((c) => c.content);

  try {
    // Create the message to send to OpenAI
    const messages = [
      {
        role: "system",
        content: `
        You are a css grid property modifier that modifies css in my custom format.
        The css I provide you is the properties of the current class that I am editing.
        Dont leave out properties that are needed for the css to work. For example if I ask you to give make  a grid layout modificaiton. You will need to include the display: grid; property and the grid-template-columns: 1fr 1fr; property.
        DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declerations and are only property declarations.
        Response in JSON format only.
        Example format response in delimmitted in triple quotes:
        """
        {
          "css": "display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;"
        }
        """
        Change the following grid css : """${css}"""  by following command : {"${text}"} . Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
        Use this metadeta as reference for the properties and format. "${JSON.stringify(
          metaDetas
        )}".
        `,
      },
      {
        role: "user",
        content: text,
      },
    ];

    // Fetch the modified CSS from OpenAI
    // Fetch the modified CSS from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: { type: "json_object" },
    });

    // Assuming the response is correctly formatted as JSON
    if (response.choices[0] && response.choices[0].message) {
      const jsonResponse = JSON.parse(response.choices[0].message.content);

      console.log("GRID_RESPONSE:", jsonResponse);

      return jsonResponse; // Return the JSON response directly
    } else {
      throw new Error("Invalid response format from AI.");
    }
  } catch (error) {
    console.error("Error processing CSS modification:", error);
    throw new Error("Failed to modify CSS due to an internal error.");
  }
}
