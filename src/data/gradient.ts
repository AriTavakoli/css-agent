import type { StylesRecord } from "./elements-index";

export const gradientStyles: StylesRecord[] = [
  {
    id: "gradient-purple-left-to-right",
    styleLess: `background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99)`,
    metadata: {
      description: "a gradient with ",
      category: "Layout",
      subcategory: "gradient",
      content: `background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99)`,
    },
  },
  {
    id: "gradient-pink-left-to-right",
    styleLess: `background: linear-gradient(to right, #ef3b36, #ffffff)`,
    metadata: {
      description:
        "vivid red on the left to a lighter, almost pink hue on the right. This smooth blend creates a warm and inviting spectrum of colors.",
      category: "Layout",
      subcategory: "gradient",
      content: `background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99)`,
    },
  },
  {
    id: "gradient-dark-blue",
    styleLess:
      "background: linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    metadata: {
      description:
        "A dark blue gradient transitioning from teal to deep navy blue",
      category: "Layout",
      subcategory: "gradient",
      content:
        "background: linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    },
  },
  {
    id: "gradient-skyblue-to-lavender",
    styleLess: "background: linear-gradient(to right, #89CFF0, #C3B1E1)",
    metadata: {
      description:
        "A smooth transition from light sky blue to soft lavender, creating a serene and inviting visual effect.",
      category: "Layout",
      subcategory: "gradient",
      content: "background: linear-gradient(to right, #89CFF0, #C3B1E1)",
    },
  },

  {
    id: "gradient-aqua-to-lavender-diagonal",
    styleLess: "background: linear-gradient(to bottom right, #89CFF0, #C3B1E1)",
    metadata: {
      description:
        "This gradient features a smooth, diagonal transition from a vibrant aqua blue at the top left to a deep, rich lavender at the bottom right. The colors blend seamlessly, creating a visually soothing effect that is both calming and aesthetically pleasing.",
      category: "Layout",
      subcategory: "gradient",
      content: "background: linear-gradient(to bottom right, #89CFF0, #C3B1E1)",
    },
  },
];
