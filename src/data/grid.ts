import type { StylesRecord } from "./elements-index";

export const gridStyles: StylesRecord[] = [
  {
    id: "grid-layout-4-columns",
    styleLess: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description: "A grid layout with 4 columns",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },
  {
    id: "grid-layout-3-columns",
    styleLess: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description: "A grid layout with 3 columns",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },

  {
    id: "grid-layout-3-columns-4-rows",
    styleLess: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto auto auto; `,
    metadata: {
      description: "A grid layout with 3 columns",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto auto auto; `,
    },
  },

  {
    id: "grid-areas_1",
    styleLess: `height: 100vh; grid-template-areas: "Area Area ." ". Area-2 Area-2"; grid-template-columns: 1fr 1fr 1fr;`,
    metadata: {
      description:
        "A grid layout with areas. In the first row, the first two columns row are combined to make an area and the last column is the same. In the second row, the first column is empty and the last two columns are combined to make an area.",
      category: "Layout",
      subcategory: "Grid",
      content: `height: 100vh; grid-template-areas: "Area Area ." ". Area-2 Area-2"; grid-template-columns: 1fr 1fr 1fr;`,
    },
  },

  {
    id: "grid-areas_2",
    styleLess: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description: `a grid layout with 2 rows and 2 columns. The first row's columns are combined to make an area. The second row's columns are not combined.`,
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },
];
