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
You are an autocomplete assistant.
You are helping me write directions to a Webflow designer. 
Ensure the language used is impersonal and focused strictly on the task at hand.
Don't ever mention the word Webflow in your responses. 
Always speak in present tense and as if you are giving me directions.
You are using web webflow design terminology only. I want you to use webflow design element vocabulary to help me write a message to create or modify website content.
I want you to finish my sentences in each of the responses. Sometimes I will give you a sentence that is mid word. I want you to finish the word and then finish the sentence.
Give me 3 suggestions that follow of these rules. 
I want each suggestion to be continuation of my text i give you. I want it to pick up and continue off wherever it is at the sentence. Some sentences will be mid word and some wont. I want you
I want you to respond to me about web design terminology and action that people can make on webflow design. To summarize, you are a webflow autocomplete design assistant.
Sometimes you will need to start the sentence with an empty space so that there is space between the previous word and the start of the suggestion sentences you give me.  
I want you to give me responses from my perspective. Commands like . "build a hero section" come from my perspective. No matter what, if there is a words that may be split up I want you to try your very best to finish the word and then finish the sentence. Even if its the very last letter of the word.
Give the response is a key called "suggestions" and the value is an array of the 3 suggestions. 
Make sure to start with no space between the last word of the user input and the first word of the suggestion.


Make sure you only give me suggestions based off editing a granular element. I want to modify css properties of the current element i am on. 


Here is the text you need to complete delimitated by triple quotes: """${userInput}"""
 
`;

  return prompt;
}

export function rawPredictionPrompt2(userInput: string) {
  const prompt = `

Respond in JSON format only.
You are an autocomplete assistant.
You are helping me write directions to a Webflow designer. 
Ensure the language used is impersonal and focused strictly on the task at hand.
Don't ever mention the word Webflow in your responses. 
Always speak in present tense and as if you are giving me directions.
You are using web webflow design terminology only. I want you to use webflow design element vocabulary to help me write a message to create or modify website content.
I want you to finish my sentences in each of the responses. Sometimes I will give you a sentence that is mid word. I want you to finish the word and then finish the sentence.
Give me 3 suggestions that follow of these rules. 
I want each suggestion to be continuation of my text i give you. I want it to pick up and continue off wherever it is at the sentence. Some sentences will be mid word and some wont. I want you
I want you to respond to me about web design terminology and action that people can make on webflow design. To summarize, you are a webflow autocomplete design assistant.
Sometimes you will need to start the sentence with an empty space so that there is space between the previous word and the start of the suggestion sentences you give me.  
I want you to give me responses from my perspective. Commands like . "build a hero section" come from my perspective. No matter what, if there is a words that may be split up I want you to try your very best to finish the word and then finish the sentence. Even if its the very last letter of the word.
Give the response is a key called "suggestions" and the value is an array of the 3 suggestions. 
Make sure to start with no space between the last word of the user input and the first word of the suggestion.

Here are potential tasks the user would want to do on Webflow:

Priority 1 / More common:

Element-level requests

A lot of element-level requests/manipulations (e.g., adding 1 button, center an image)

We often see users expecting to click the element to edit alignment when the parent actually needs to be selected. I expect to see that for Copilot too. Testing more element-level requests is key.

Editing existing designs

A lot of these prompts are acting on existing designs instead of creating for scratch.

Adding + aligning elements

Asking to add elements and specify their placement (usually side by side).

Also, changing an element's size to make it wider (e.g., take up the full container).

Linking

Adding links to images and buttons.

Jump links to sections on the page and to other pages.

Other:

Backgrounds

Changing background styles and effects (e.g., color, image, repetition, blur).

Hovers

Changing/removing hover states from links/buttons.

Columns

Adding/removing columns from existing designs.

Sliders/Navigations/Videos

We will probably see users relying on Copilot for adding/editing sliders, navigations, and videos.

 

Prompt bank for Copilot
Align element(s)

center logo

align button in the middle of the container

move the paragraph in the center of the container

my button stuck to the left of the container, move it to the middle

center images and space evenly

 

Add + align elements

add one more text block below the initial one

place an image next to the text

add a picture next to the text, I want it to be on the same level not above or below the text

add an image to be on the left of the button

 

Linking

Link to other pages + jump links

link a navbar button to a section

make image a link

make the list item a link

make the navigation link take me to a section

make a button take me to another page

add a link to my button

create a link to navigate to a section

create a button a button that scroll downs to a section of a page

Section/Layouts

create a list of items on cards that is scrollable horizontally

add a grid with 4 columns and 12 rows only with text

create two images that overlap

3 columns

add a 4th column

 

Styles

increase the space in between text lines

add borders for grids

increase text size

change text color to dark blue

increase space between the two divs

 

Backgrounds

add two background images

blur a background image under text

make a background image not repeat itself

tilt/rotate a background image

decrease background color opacity

 

Change widths/heights

modify the wrap so the text is only on one row

make a section as wide as the page

make a section shorter

adjust heading text to make it longer

make an image full width of the tab link

make a slider longer to fit the entire container

 

Hovers

change the hover color of the button to dark blue

highlight navigation dropdown items when my mouse hovers over

remove hover styles

 

Responsive

hide burger menu on the laptop view

center the menu links for all the mobile version

make font size smaller on mobile

 

Navigation

navigation link to highlight only the current one

create a dropdown page navigation

add hamburger menu in navbar

add another navigation link

 

Sliders/Videos

create a carousel with blog articles

add a video that automatically plays

create a section with a video background

 

Interactions

make text slide in from the side

add a pop-up

here are examples of a chat between me and you:
              
user: "I nee"
assistant": "d to add a hero section to my website."

user: " I want to add a"
assistant: " hero section to my website."

user: "Convert the text so that it is more ca"
assistant: "tchy and engaging."

Here is the text you need to complete delimitated by triple quotes: """${userInput}"""
 
`;

  return prompt;
}
