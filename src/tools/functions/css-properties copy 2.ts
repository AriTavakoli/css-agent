import OpenAI from "openai";
import { getContext } from "../../utils/context";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { Model } from "../../api/routes/suggestion";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { trace } from "console";

const assistantConfig = {
  cssEditor: "asst_ASICR1tnEzHZj5UkwNO0wtlp",
};

export const editCss = traceable(async ({ css, text }) => {
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
        You are a css property modifier that modifies css in my custom format.
        The css I provide you is the properties of the current class that I am editing.
        The goal is to modify + add the relevant properties not replace. You will need to provide comprehensive when you give me css properties. Dont leave out properties that are needed for the css to work. For example if I ask you to give make a flex row modificaiton. You will need to include the display: flex; property and the flex-direction: row; property.
        DO NOT use any syntax like brackets and selectors. The format I want you to respond is a format that strips down and class declarations and are only property declarations.
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
    const pipeline = traceable(async (messages) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
      });
      const result = response.choices[0].message.content;
      return JSON.parse(result);
    });

    const response = await pipeline(messages);
    // Assuming the response is correctly formatted as JSON
    return response;
  } catch (error) {
    console.error("Error processing CSS modification:", error);
    throw new Error("Failed to modify CSS due to an internal error.");
  }
});
