import { FC, useState } from "react";
import { FlexboxTemplate, FlexContainerProps, FlexItemProps } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, FolderOpen, Trash2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRandomPastelColor } from "./utils";
import { v4 as uuidv4 } from "uuid";

// Common layout templates
const commonTemplates = [
  {
    name: "Navbar",
    container: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "normal",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f8f9fa",
      width: "100%",
      height: "64px",
    } as FlexContainerProps,
    items: [
      {
        id: uuidv4(),
        order: 0,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "120px",
        height: "32px",
        content: "Logo",
      },
      {
        id: uuidv4(),
        order: 1,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "auto",
        height: "32px",
        content: "Navigation",
      },
      {
        id: uuidv4(),
        order: 2,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "100px",
        height: "32px",
        content: "Login",
      },
    ],
  },
  {
    name: "Card Grid",
    container: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "stretch",
      alignContent: "normal",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f8f9fa",
      width: "100%",
      height: "300px",
    } as FlexContainerProps,
    items: Array(6)
      .fill(0)
      .map((_, i) => ({
        id: uuidv4(),
        order: i,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "calc(33% - 16px)",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "auto",
        height: "120px",
        content: `Card ${i + 1}`,
      })),
  },
  {
    name: "Holy Grail Layout",
    container: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      justifyContent: "flex-start",
      alignItems: "stretch",
      alignContent: "normal",
      gap: "8px",
      padding: "8px",
      backgroundColor: "#f8f9fa",
      width: "100%",
      height: "400px",
    } as FlexContainerProps,
    items: [
      {
        id: uuidv4(),
        order: 0,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "100%",
        height: "60px",
        content: "Header",
      },
      {
        id: uuidv4(),
        order: 1,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "100%",
        height: "200px",
        content: "Main Content",
      },
      {
        id: uuidv4(),
        order: 2,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "100%",
        height: "60px",
        content: "Footer",
      },
    ],
  },
  {
    name: "Sidebar Layout",
    container: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      justifyContent: "flex-start",
      alignItems: "stretch",
      alignContent: "normal",
      gap: "0px",
      padding: "0px",
      backgroundColor: "#f8f9fa",
      width: "100%",
      height: "400px",
    } as FlexContainerProps,
    items: [
      {
        id: uuidv4(),
        order: 0,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "250px",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "auto",
        height: "100%",
        content: "Sidebar",
      },
      {
        id: uuidv4(),
        order: 1,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        backgroundColor: getRandomPastelColor(),
        width: "auto",
        height: "100%",
        content: "Main Content",
      },
    ],
  },
];

interface FlexboxTemplateManagerProps {
  templates: FlexboxTemplate[];
  onSaveTemplate: (name: string) => string;
  onLoadTemplate: (id: string) => void;
  onDeleteTemplate?: (id: string) => void;
}

export const FlexboxTemplateManager: FC<FlexboxTemplateManagerProps> = ({
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
}) => {
  const [newTemplateName, setNewTemplateName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    onSaveTemplate(newTemplateName);
    setNewTemplateName("");
    setSaveDialogOpen(false);
    toast.success(`Template "${newTemplateName}" saved successfully`);
  };

  const handleLoadTemplate = (id: string) => {
    onLoadTemplate(id);
    setLoadDialogOpen(false);
    const template = templates.find((t) => t.id === id);
    if (template) {
      toast.success(`Template "${template.name}" loaded successfully`);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (onDeleteTemplate) {
      onDeleteTemplate(id);
      const template = templates.find((t) => t.id === id);
      if (template) {
        toast.success(`Template "${template.name}" deleted successfully`);
      }
    }
  };

  const handleLoadCommonTemplate = (template: (typeof commonTemplates)[0]) => {
    // Create a new template with unique IDs
    const newTemplate: FlexboxTemplate = {
      id: uuidv4(),
      name: template.name,
      container: { ...template.container },
      items: template.items.map((item) => ({
        ...item,
        id: uuidv4(),
        alignSelf: item.alignSelf as FlexItemProps["alignSelf"],
      })),
      created: new Date(),
      lastModified: new Date(),
    };

    // Add to templates and load it
    onLoadTemplate(newTemplate.id);
    setLoadDialogOpen(false);
    toast.success(`Template "${template.name}" loaded successfully`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Templates</h3>
        <div className="flex space-x-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="mr-1 h-4 w-4" /> Save Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveTemplate} className="w-full">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="mr-1 h-4 w-4" /> Load Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Load Template</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <Tabs defaultValue="saved">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="saved">Saved Templates</TabsTrigger>
                    <TabsTrigger value="common">Common Layouts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="saved">
                    {templates.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No templates saved yet
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {template.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Created: {formatDate(template.created)}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleLoadTemplate(template.id)
                                  }
                                >
                                  Load
                                </Button>
                                {onDeleteTemplate && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteTemplate(template.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="common">
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {commonTemplates.map((template, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Common layout template
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadCommonTemplate(template)}
                            >
                              <LayoutTemplate className="mr-1 h-4 w-4" /> Use
                              Template
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Save your flexbox layouts as templates to reuse them later.
      </div>
    </Card>
  );
};
