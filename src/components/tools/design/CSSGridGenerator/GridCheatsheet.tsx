import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeSampleProps {
  code: string;
  label?: string;
}

const CodeSample: FC<CodeSampleProps> = ({ code, label }) => (
  <div className="mt-2">
    {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
    <pre className="bg-gray-950 text-gray-50 p-2 rounded-md text-xs overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

export const GridCheatsheet: FC = () => {
  return (
    <Tabs defaultValue="basics" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="basics">Basics</TabsTrigger>
        <TabsTrigger value="alignment">Alignment</TabsTrigger>
        <TabsTrigger value="areas">Grid Areas</TabsTrigger>
        <TabsTrigger value="responsive">Responsive Grid</TabsTrigger>
      </TabsList>

      <TabsContent value="basics" className="mt-4 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Basic Grid Container</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            The CSS Grid Layout is a two-dimensional grid system designed to
            handle both rows and columns.
          </p>

          <CodeSample
            code={`.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 300px auto;
  gap: 20px;
}`}
          />

          <div className="mt-4 space-y-2">
            <h4 className="text-md font-medium">Common Track Sizing Units</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  fr
                </code>{" "}
                - Fraction of free space (1fr, 2fr)
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  auto
                </code>{" "}
                - Size based on content
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  min-content
                </code>{" "}
                - Minimum size based on content
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  max-content
                </code>{" "}
                - Maximum size based on content
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  minmax(min, max)
                </code>{" "}
                - Size between minimum and maximum values
              </li>
              <li>
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  repeat(n, size)
                </code>{" "}
                - Repeat pattern n times
              </li>
            </ul>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-md font-medium">Track Sizing Examples</h4>
            <CodeSample
              code={`grid-template-columns: 1fr 1fr 1fr;        /* Three equal columns */
grid-template-columns: 200px 1fr 1fr;      /* Fixed + flexible columns */
grid-template-columns: repeat(3, 1fr);     /* Three equal columns using repeat */
grid-template-columns: minmax(100px, 1fr); /* Column with min/max size */`}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Gap and Spacing</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Control the spacing between grid items with gap properties.
            </p>

            <CodeSample
              code={`gap: 20px;                /* Same gap for rows and columns */
row-gap: 20px;            /* Gap between rows only */
column-gap: 10px;         /* Gap between columns only */
gap: 20px 10px;           /* Row gap and column gap */`}
            />
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="alignment" className="mt-4 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Container Alignment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Control how items are distributed within the grid container.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">
                Justify Content (Row Axis)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    start
                  </code>{" "}
                  - Items packed at start
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    end
                  </code>{" "}
                  - Items packed at end
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    center
                  </code>{" "}
                  - Items centered
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-between
                  </code>{" "}
                  - Items evenly distributed with space between
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-around
                  </code>{" "}
                  - Items evenly distributed with space around
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-evenly
                  </code>{" "}
                  - Items evenly distributed with equal space
                </li>
              </ul>

              <CodeSample
                code={`justify-content: space-between;`}
                label="Example"
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">
                Align Content (Column Axis)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    start
                  </code>{" "}
                  - Items packed at start
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    end
                  </code>{" "}
                  - Items packed at end
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    center
                  </code>{" "}
                  - Items centered
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-between
                  </code>{" "}
                  - Items evenly distributed with space between
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-around
                  </code>{" "}
                  - Items evenly distributed with space around
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    space-evenly
                  </code>{" "}
                  - Items evenly distributed with equal space
                </li>
              </ul>

              <CodeSample code={`align-content: center;`} label="Example" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Item Alignment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Control how individual items are positioned within their grid cell.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">
                Justify Items (Row Axis)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    start
                  </code>{" "}
                  - Items aligned to start
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    end
                  </code>{" "}
                  - Items aligned to end
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    center
                  </code>{" "}
                  - Items centered
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    stretch
                  </code>{" "}
                  - Items stretched to fill cell (default)
                </li>
              </ul>

              <CodeSample
                code={`justify-items: center;`}
                label="Container setting"
              />

              <CodeSample
                code={`justify-self: end;`}
                label="Individual item setting"
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">
                Align Items (Column Axis)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    start
                  </code>{" "}
                  - Items aligned to start
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    end
                  </code>{" "}
                  - Items aligned to end
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    center
                  </code>{" "}
                  - Items centered
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    stretch
                  </code>{" "}
                  - Items stretched to fill cell (default)
                </li>
              </ul>

              <CodeSample
                code={`align-items: center;`}
                label="Container setting"
              />

              <CodeSample
                code={`align-self: start;`}
                label="Individual item setting"
              />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="areas" className="mt-4 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Grid Template Areas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Create named grid areas for easier layout definition and item
            placement.
          </p>

          <CodeSample
            code={`.container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  gap: 10px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }`}
          />

          <div className="mt-4 space-y-2">
            <h4 className="text-md font-medium">Notes on Grid Areas</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Each string represents a row</li>
              <li>Each word represents a cell in that row</li>
              <li>Repeat the same name to span multiple cells</li>
              <li>
                Use{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  .
                </code>{" "}
                for empty cells
              </li>
              <li>Each row must have the same number of cells</li>
            </ul>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Item Placement</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Alternative ways to place items within the grid.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Line-based Placement</h4>
              <CodeSample
                code={`.item {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
}

/* Shorthand version */
.item {
  grid-column: 1 / 3;
  grid-row: 2 / 4;
}

/* Using span */
.item {
  grid-column: 1 / span 2;
  grid-row: 2 / span 2;
}`}
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Named Lines</h4>
              <CodeSample
                code={`.container {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 1fr
    [sidebar-end main-start] 3fr
    [main-end aside-start] 1fr
    [aside-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
}`}
              />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="responsive" className="mt-4 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            Responsive Grid Techniques
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Approaches for creating responsive grid layouts.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">Auto-fill & Auto-fit</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Create flexible grids that adjust the number of columns based on
                available space.
              </p>
              <CodeSample
                code={`/* Auto-fill: As many columns as will fit */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

/* Auto-fit: Similar to auto-fill but collapses empty tracks */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`}
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">
                Responsive Areas with Media Queries
              </h4>
              <CodeSample
                code={`.container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
  }
}`}
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">
                Responsive Layouts with minmax()
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Create columns that won't shrink below a minimum size.
              </p>
              <CodeSample
                code={`grid-template-columns: repeat(3, minmax(200px, 1fr));`}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            Advanced Responsive Techniques
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">
                Auto Placement Strategies
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Control how items are automatically placed in the grid.
              </p>
              <CodeSample
                code={`grid-auto-flow: row;        /* Default, fill rows first */
grid-auto-flow: column;     /* Fill columns first */
grid-auto-flow: dense;      /* Fill in holes in the grid */
grid-auto-flow: row dense;  /* Fill rows and dense packing */`}
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">
                Subgrid (New Feature)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Allow nested grids to inherit track sizing from parent grid.
              </p>
              <CodeSample
                code={`.parent {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
}

.child {
  grid-column: 2 / 7;
  display: grid;
  grid-template-columns: subgrid;
}`}
              />
              <p className="text-xs text-amber-500 mt-1">
                ⚠️ Note: Subgrid has limited browser support
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
