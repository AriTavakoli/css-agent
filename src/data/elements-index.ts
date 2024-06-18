import { gradientStyles } from "./gradient";
import { gridStyles } from "./grid";

export type StylesRecord = {
  id: string;
  styleLess: string;
  metadata: {
    description: string;
    category: "Layout" | "Style";
    subcategory?: string;
    content?: string;
  };
};

const styles: StylesRecord[] = [
  ...gridStyles,
  ...gradientStyles,
  {
    id: "border-style",
    styleLess: `border-bottom-style: solid; border-bottom-width: 1px; border-bottom-color: hsla(212.00000000000006, 38.46%, 92.35%, 1.00); background-color: hsla(216, 33.33%, 97.06%, 1.00);`,
    metadata: {
      description: "A border style",
      category: "Style",
      subcategory: "Border",
      content:
        "border-bottom-style: solid; border-bottom-width: 1px; border-bottom-color: hsla(212.00000000000006, 38.46%, 92.35%, 1.00); background-color: hsla(216, 33.33%, 97.06%, 1.00);",
    },
  },

  {
    id: "flex-column",
    styleLess: `display: flex; flex-direction: column; justify-content: center; align-items: center;`,
    metadata: {
      description: "A flex column",
      category: "Layout",
      subcategory: "Flex",
      content:
        "display: flex; flex-direction: column; justify-content: center; align-items: center;",
    },
  },

  {
    id: "flex-row",
    styleLess: `display: flex; flex-direction: row; justify-content: center; align-items: center;`,
    metadata: {
      description: "A flex row",
      category: "Layout",
      subcategory: "Flex",
      content:
        "display: flex; flex-direction: row; justify-content: center; align-items: center;",
    },
  },

  {
    id: "filter-blur",
    styleLess: `filter: blur(5px);`,
    metadata: {
      description: "A filter blur",
      category: "Style",
      subcategory: "Filter",
      content: "filter: blur(5px);",
    },
  },

  {
    id: "shadow",
    styleLess: `box-shadow: 0 4px 24px 0 hsla(214.83870967741936, 17.32%, 64.90%, 0.08);`,
    metadata: {
      description: "A shadow style",
      category: "Style",
      subcategory: "Shadow",
      content: `box-shadow: 0 4px 24px 0 hsla(214.83870967741936, 17.32%, 64.90%, 0.08);`,
    },
  },

  {
    id: "gradient-bg_1",
    styleLess: `background-image: radial-gradient(1905.5% 164.95% at 111.64% 118.21%, rgb(164, 126, 255) 0%, rgb(179, 148, 248) 27.08%, rgb(229, 147, 198) 53.65%, rgb(255, 161, 151) 77.6%, rgb(244, 216, 169) 99.49%);`,
    metadata: {
      description: "a background gradient style with a few a color stop",
      category: "Style",
      subcategory: "Gradient",
      content: `width : 100%; height: 100%; background: linear-gradient(102deg, rgb(153, 224, 255) 0%, rgba(86, 98, 239, 0.5) 50%, rgb(135, 143, 241) 100%)`,
    },
  },
];

export { styles };
