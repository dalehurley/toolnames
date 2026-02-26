import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const FlexboxCheatsheet: FC = () => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Flexbox Cheatsheet</h3>

      <Tabs defaultValue="container" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="container">Container Properties</TabsTrigger>
          <TabsTrigger value="items">Item Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="container" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">display: flex | inline-flex</h4>
            <p className="text-sm text-muted-foreground">
              Defines a flex container.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">flex</div>
                <div className="bg-blue-100 h-8 flex items-center justify-center text-xs">
                  Block-level flex container
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">inline-flex</div>
                <div className="bg-blue-100 h-8 inline-flex items-center justify-center text-xs">
                  Inline flex container
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">
              flex-direction: row | row-reverse | column | column-reverse
            </h4>
            <p className="text-sm text-muted-foreground">
              Defines the main axis direction.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">row</div>
                <div className="bg-blue-100 h-12 flex flex-row items-center justify-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">row-reverse</div>
                <div className="bg-blue-100 h-12 flex flex-row-reverse items-center justify-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">column</div>
                <div className="bg-blue-100 h-24 flex flex-col items-center justify-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">column-reverse</div>
                <div className="bg-blue-100 h-24 flex flex-col-reverse items-center justify-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">
              justify-content: flex-start | flex-end | center | space-between |
              space-around | space-evenly
            </h4>
            <p className="text-sm text-muted-foreground">
              Aligns items along the main axis.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">flex-start</div>
                <div className="bg-blue-100 h-12 flex justify-start items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">flex-end</div>
                <div className="bg-blue-100 h-12 flex justify-end items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">center</div>
                <div className="bg-blue-100 h-12 flex justify-center items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">space-between</div>
                <div className="bg-blue-100 h-12 flex justify-between items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">space-around</div>
                <div className="bg-blue-100 h-12 flex justify-around items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">space-evenly</div>
                <div className="bg-blue-100 h-12 flex justify-evenly items-center text-xs">
                  <div className="bg-blue-500 text-white p-1 m-1">1</div>
                  <div className="bg-blue-500 text-white p-1 m-1">2</div>
                  <div className="bg-blue-500 text-white p-1 m-1">3</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">flex-grow: number</h4>
            <p className="text-sm text-muted-foreground">
              Defines the ability for a flex item to grow if necessary.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">
                  flex-grow: 0, 1, 2
                </div>
                <div className="bg-blue-100 h-12 flex items-center text-xs">
                  <div
                    className="bg-blue-500 text-white p-1 m-1"
                    style={{ flexGrow: 0 }}
                  >
                    flex-grow: 0
                  </div>
                  <div
                    className="bg-green-500 text-white p-1 m-1"
                    style={{ flexGrow: 1 }}
                  >
                    flex-grow: 1
                  </div>
                  <div
                    className="bg-red-500 text-white p-1 m-1"
                    style={{ flexGrow: 2 }}
                  >
                    flex-grow: 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">flex-shrink: number</h4>
            <p className="text-sm text-muted-foreground">
              Defines the ability for a flex item to shrink if necessary.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">
                  flex-shrink: 0, 1, 2
                </div>
                <div
                  className="bg-blue-100 h-12 flex items-center text-xs"
                  style={{ width: "100%" }}
                >
                  <div
                    className="bg-blue-500 text-white p-1 m-1"
                    style={{ flexShrink: 0, width: "200px" }}
                  >
                    flex-shrink: 0
                  </div>
                  <div
                    className="bg-green-500 text-white p-1 m-1"
                    style={{ flexShrink: 1, width: "200px" }}
                  >
                    flex-shrink: 1
                  </div>
                  <div
                    className="bg-red-500 text-white p-1 m-1"
                    style={{ flexShrink: 2, width: "200px" }}
                  >
                    flex-shrink: 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">
              align-self: auto | flex-start | flex-end | center | baseline |
              stretch
            </h4>
            <p className="text-sm text-muted-foreground">
              Overrides the align-items value for specific flex items.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="border p-2 rounded">
                <div className="text-xs font-medium mb-1">
                  Different align-self values
                </div>
                <div className="bg-blue-100 h-24 flex items-center text-xs">
                  <div
                    className="bg-blue-500 text-white p-1 m-1"
                    style={{ alignSelf: "flex-start" }}
                  >
                    flex-start
                  </div>
                  <div
                    className="bg-green-500 text-white p-1 m-1"
                    style={{ alignSelf: "center" }}
                  >
                    center
                  </div>
                  <div
                    className="bg-red-500 text-white p-1 m-1"
                    style={{ alignSelf: "flex-end" }}
                  >
                    flex-end
                  </div>
                  <div
                    className="bg-yellow-500 text-white p-1 m-1"
                    style={{ alignSelf: "stretch", height: "auto" }}
                  >
                    stretch
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
