import { ChatCompletionTool } from "openai/resources";

const cssPropertyTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "editGrid",
      description:
        "edit the grid provided in the exact format provided. This does not return anything other than the css.",
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
  {
    type: "function",
    function: {
      name: "editShadow",
      description:
        " provide me with new css properties or modify the one's i provide in the exact format provided. This does not return anything other than the css.",
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
      name: "editPosition",
      description: `
     a css editor tool that deals with position only.`,
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the CSS position",
          },
        },
        required: ["css", "text"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "editGradient",
      description: `
     a css editor tool that deals with advanced gradients only.`,
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the css gradient",
          },
        },
        required: ["css", "text"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "editSpacing",
      description: `
     a css editor tool that deals with spacing only.`,
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the css spacing",
          },
        },
        required: ["css", "text"],
      },
    },
  },
];

export { cssPropertyTools };
