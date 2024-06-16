const gridTools = [
  {
    type: "function",
    function: {
      name: "editGrid",
      description:
        "edit the grid properties provided in the exact format provided",
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS string to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the grid",
          },
        },
        required: ["css", "text"],
      },
    },
  },
];

const shadowTools = [
  {
    type: "function",
    function: {
      name: "editShadow",
      description:
        "edit the shadow properties provided in the exact format provided",
      parameters: {
        type: "object",
        properties: {
          css: {
            type: "string",
            description: "The CSS string to be modified",
          },
          text: {
            type: "string",
            description: "Instructions on how to modify the shadow",
          },
        },
        required: ["css", "text"],
      },
    },
  },
];
export { gridTools, shadowTools };
