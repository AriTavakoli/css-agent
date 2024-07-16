import express from "express";
import OpenAI from "openai";

const router = express.Router();

type SuggestionResponse = string[];

router.get<{}, SuggestionResponse>("/", async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.HACKATON_OPENAI_API_KEY });
  const text = req.query.text;

  if (text) {
    console.log("Received text:", text);

    const prompt = rawPredictionPrompt(text as string);

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: text,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: messages,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      res.json({ response });
    } catch (error) {
      console.error("Error while fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  } else {
    res.status(400).json({ message: "No input text provided." });
    console.log("Request failed: No input text provided.");
  }
});

export default router;

export function rawPredictionPrompt(userInput: string) {
  const prompt = `
Respond in JSON format only.
You are an autocomplete assistant that takes in takes incomplete sentences and finishes them.
Most sentences are about changing the current css of an element. 
Sometimes I will give you a sentence that is mid word. I want you to finish the word and then finish the sentence.
Give me 3 suggestions that follow of these rules. 
I want each suggestion to be continuation of my text i give you. I want it to pick up and continue off wherever it is at the sentence. Some sentences will be mid word and some wont. I want you
I want you to respond to me about web design terminology and action that people can make on webflow design. To summarize, you are a webflow autocomplete design assistant.
Sometimes you will need to start the sentence with an empty space so that there is space between the previous word and the start of the suggestion sentences you give me.  
I want you to give me responses from my perspective.   No matter what, if there is a words that may be split up I want you to try your very best to finish the word and then finish the sentence. Even if its the very last letter of the word.
Give the response is a key called "suggestions" and the value is an array of the 3 suggestions. 
Make sure to start with no space between the last word of the user input and the first word of the suggestion.

I want you to provide me with suggestions like the following. The goal is to be very brief and to the point.

"make the corners rounded 24px"
"add a bottom left shadow"
"add a bottom right shadow"
"make this width 300px" 
"add a gradient to the background"
"make the bg color dark blue"
"on hover make it spin"
"add a border to the bottom"
"br right 24px"

No matter what, if there is a words that may be split up I want you to try your very best to finish the word and then finish the sentence. Even if its the very last letter of the word.
Give the response is a key called "suggestions" and the value is an array of the 3 suggestions. 
Make sure to start with no space between the last word of the user input and the first word of the suggestion.
Never include the user input in the suggestion. ONLY the continuation of the sentence.


Make sure you only give me suggestions based off editing a granular element. I want to modify css properties of the current element i am on. 


Here is the text you need to complete delimitated by triple quotes. Follow all the rules I just mentioned to you above and finish this group of chars """${userInput}"""
 
`;

  return prompt;
}
