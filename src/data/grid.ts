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

  {
    id: "two-column-grid-two-rows",
    styleLess: `display: grid; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description: `a two column by 2 row grid with the top row of the grid connected to make an area`,
      category: "Layout",
      subcategory: "Grid",
      content: `grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },

  {
    id: "two-column-grid-two-rows-full-height",
    styleLess: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area" "Area-2 Area-2"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description:
        "a two-column by two-row grid with full viewport height where each row spans across two columns making two distinct areas, Area and Area-2",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area" "Area-2 Area-2"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },

  {
    id: "two-column-grid-two-rows-asymmetric",
    styleLess: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area-3" "Area-2 Area-3"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description:
        "a two-column by two-row grid with full viewport height, featuring an asymmetric layout where the second column on both rows is merged into a single area, Area-3, while the first column contains Area and Area-2 in the first and second row respectively",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area-3" "Area-2 Area-3"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },

  {
    id: "two-column-grid-two-rows-vertical-merge",
    styleLess: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area-3" "Area Area-3"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    metadata: {
      description:
        "a two-column by two-row grid with full viewport height, where the first column, Area, spans both rows vertically, and the second column, Area-3, also spans both rows vertically, creating a consistent vertical division across the grid",
      category: "Layout",
      subcategory: "Grid",
      content: `display: grid; height: 100vh; grid-auto-columns: 1fr; grid-column-gap: 16px; grid-row-gap: 16px; grid-template-areas: "Area Area-3" "Area Area-3"; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`,
    },
  },
];
