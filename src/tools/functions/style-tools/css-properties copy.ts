import OpenAI from "openai";
import { getContext } from "../../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { Model } from "../../../api/routes/suggestion";

export default async function editCss(css, text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Retrieve context from your custom function, assuming it returns relevant information
  const context = (await getContext(
    text,
    0.7,
    false
  )) as ScoredPineconeRecord[];

  const metaDetas = context.map((c) => c.metadata);

  console.log("Metadata:", metaDetas);

  console.log(context, "context");
  console.log(css, "css");
  console.log(text, "text");

  // const { content } = context[0].metadata;

  try {
    // Create the message to send to OpenAI
    const messages = [
      {
        role: "system",
        content: `
        You are a css property modifier that modifies css in my custom format.
        The css I provide you is the properties of the current class that I am editing.
        The goal is to modify + add the relevant properties not replace. You will need to provide comprehensive when you give me css properties. Dont leave out properties that are needed for the css to work. For example if I ask you to give make a flex row modificaiton. You will need to include the display: flex; property and the flex-direction: row; property.
        DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declerations and are only property declarations.
        Response in JSON format only.
        Example format response in delimmitted in triple quotes:
        """
        {
          "css": "display: flex; max-width: 750px; margin-right: auto; margin-left: auto; flex-direction: column; justify-content: flex-start; align-items: center; border-bottom: 1px solid red; text-align: center;"
        }
        """
        Change the following CSS delimmited in xml tags <${css}>  with this following command : {"${text}"} . I want you to include the previous properties or override them if necessary. Do not just give me the standalone properties you just created. I rely on the previous properties for my class.
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
    const response = await openai.chat.completions.create({
      model: Model.gpt3,
      messages: messages,
      response_format: { type: "json_object" },
    });

    // Assuming the response is correctly formatted as JSON
    if (response.choices[0] && response.choices[0].message) {
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      console.log("AI response:", jsonResponse);
      return jsonResponse; // Return the JSON response directly
    } else {
      throw new Error("Invalid response format from AI.");
    }
  } catch (error) {
    console.error("Error processing CSS modification:", error);
    throw new Error("Failed to modify CSS due to an internal error.");
  }
}
