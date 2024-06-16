import { ChatCompletionTool } from "openai/resources";

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "editCss",
      description:
        "you will have to pick a tool to edit the css correctly.",
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the CSS",
          },
        },
        required: ["css", "text"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "editInteractions",
      description: `edit pseudo-classes and other interaction properties in the css provided in the exact format provided. This covers anything to do with hover, active, focus
      it only returns the properties inside a variants object.
      `,
      parameters: {
        type: "object",
        properties: {
          variants: {
            type: "object",
            properties: {
              main_hover: { type: "string" },
              main_focus: { type: "string" },
              main_active: { type: "string" },
            },
            description:
              "the pseudo-classes and other interaction properties to be modified",
          },
          text: {
            type: "string",
            description:
              "Instructions on how to modify the interaction properties",
          },
        },
        required: ["variants", "text"],
      },
    },
  },
];

export { tools };
