import type { FunctionDefinition } from "openai/resources";
import autocomplete from "./functions/autocomplete";
import getVariables from "./functions/getVariables";

const tools: FunctionDefinition[] = [
  {
    name: "use_stylesheet_variables",
    description: "Apply stylesheet variables to a stylesheet",
    parameters: {
      type: "object",
      properties: {
        variables: {
          type: "array",
          items: {
            type: "array",
            description:
              "Stylesheet variable in the a new starting with an @ symbol. For examples @primary-color, @secondary-color.",
          },
          description: "Array of stylesheet variable names",
        },
      },
      required: ["variables"],
    },
  },

  {
    name: "autocomplete",
    description: "normal autocomplete request",
    parameters: {
      type: "object",
      properties: {
        type: "object",
        text: {
          type: "string",
          description: "The text to autocomplete",
        },
      },
      required: ["text"],
    },
  },
];

const availableFunctions = {
  use_stylesheet_variables: getVariables,
  autocomplete: autocomplete,
};

export { tools, availableFunctions };
