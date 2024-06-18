import type { StylesRecord } from "./elements-index";

export const shadowStyles: StylesRecord[] = [
  {
    id: "soft-shadow",
    styleLess: `box-shadow: 5px 2px 13px 0 rgba(0,0,0,0.2);`,
    metadata: {
      description:
        "a subtle shadow effect on a rectangular element, appearing to be elevated off its background. The shadow has a slight horizontal and vertical offset to the right and bottom, respectively, creating a natural drop shadow effect. The blur radius extends moderately, producing a smooth, diffused shadow edge. The shadow color is a semi-transparent black, giving it a realistic shade without overpowering the main element.",
      category: "Style",
      subcategory: "shadow",
      content: `box-shadow: 5px 2px 13px 0 rgba(0,0,0,0.2);`,
    },
  },

  {
    id: "extended-shadow",
    styleLess: `box-shadow: 20px 2px 18px 20px rgba(0,0,0,0.2);`,
    metadata: {
      description:
        "a shadow with a noticeable rightward and slight downward spread, creating a broad and soft shadow effect.",
      category: "Style",
      subcategory: "shadow",
      content: `box-shadow: 20px 2px 18px 20px rgba(0,0,0,0.2);`,
    },
  },

  {
    id: "subtle-left-shadow",
    styleLess: `box-shadow: -3px 2px 19px 5px rgba(0,0,0,0.2);`,
    metadata: {
      description:
        "a shadow that spreads slightly to the left and downward, with a moderate blur, creating a subtle fading effect.",
      category: "Style",
      subcategory: "shadow",
      content: `box-shadow: -3px 2px 19px 5px rgba(0,0,0,0.2);`,
    },
  },
];
