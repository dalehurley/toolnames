import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CustomizationOptions, ViewportSize } from "../hooks/useComponentState";
import { getTemplatesByCategory } from "../utils/componentTemplates";
import {
  colorOptions,
  typographyOptions,
  spacingOptions,
  borderOptions,
  shadowOptions,
} from "../utils/tailwindHelpers";
import { Check, RefreshCw } from "lucide-react";

interface ComponentControlsProps {
  selectedComponentType: string;
  setSelectedComponentType: (type: string) => void;
  customizationOptions: CustomizationOptions;
  updateCustomization: (
    category: keyof CustomizationOptions,
    property: string,
    value: string | boolean | ViewportSize[]
  ) => void;
  resetCustomization: () => void;
  componentName: string;
  setComponentName: (name: string) => void;
}

// Type alias for component category
type ComponentCategory =
  | "button"
  | "card"
  | "form"
  | "navigation"
  | "layout"
  | "data";

export const ComponentControls: FC<ComponentControlsProps> = ({
  selectedComponentType,
  setSelectedComponentType,
  customizationOptions,
  updateCustomization,
  resetCustomization,
  componentName,
  setComponentName,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<ComponentCategory>("button");

  // Handle component type change
  const handleComponentTypeChange = (type: string) => {
    setSelectedComponentType(type);
  };

  // Handle category change
  const handleCategoryChange = (category: ComponentCategory) => {
    setSelectedCategory(category);
    // Set the first component of the category as selected
    const templates = getTemplatesByCategory(category);
    if (templates.length > 0) {
      setSelectedComponentType(templates[0].id);
    }
  };

  // Categories for the component types
  const categories = [
    { id: "button" as ComponentCategory, label: "Buttons" },
    { id: "card" as ComponentCategory, label: "Cards" },
    { id: "form" as ComponentCategory, label: "Forms" },
    { id: "navigation" as ComponentCategory, label: "Navigation" },
    { id: "layout" as ComponentCategory, label: "Layout" },
    { id: "data" as ComponentCategory, label: "Data Display" },
  ];

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Component Settings</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="componentName">Component Name</Label>
            <Input
              id="componentName"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Component Type</Label>
            <Tabs
              value={selectedCategory}
              onValueChange={(value) =>
                handleCategoryChange(value as ComponentCategory)
              }
              className="mt-2"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                {categories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-3">
                {categories.slice(3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {getTemplatesByCategory(category.id).map((template) => (
                      <Button
                        key={template.id}
                        variant={
                          selectedComponentType === template.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleComponentTypeChange(template.id)}
                        className="justify-start text-left h-auto py-2"
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">
                            {template.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Customization</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={resetCustomization}
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </Button>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["colors", "typography"]}
          className="space-y-2"
        >
          {/* Colors Section */}
          <AccordionItem
            value="colors"
            className="border rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              Colors
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Background Color */}
                <div>
                  <Label className="block mb-2">Background Color</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {colorOptions.backgrounds.slice(0, 14).map((color) => (
                      <div
                        key={color.value}
                        className={`
                          w-8 h-8 rounded-md cursor-pointer relative border border-gray-200
                          hover:scale-110 transition-transform ${color.value} 
                          ${
                            customizationOptions.colors.background ===
                            color.value
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                        `}
                        title={color.label}
                        onClick={() =>
                          updateCustomization(
                            "colors",
                            "background",
                            color.value
                          )
                        }
                      >
                        {customizationOptions.colors.background ===
                          color.value && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check
                              size={14}
                              className="text-white drop-shadow"
                            />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <Label className="block mb-2">Text Color</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {colorOptions.text.slice(0, 14).map((color) => (
                      <div
                        key={color.value}
                        className={`
                          w-8 h-8 rounded-md cursor-pointer relative border border-gray-200
                          hover:scale-110 transition-transform bg-gray-100
                          ${
                            customizationOptions.colors.text === color.value
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                        `}
                        title={color.label}
                        onClick={() =>
                          updateCustomization("colors", "text", color.value)
                        }
                      >
                        <div
                          className={`absolute inset-0 flex items-center justify-center ${color.value}`}
                        >
                          Aa
                        </div>
                        {customizationOptions.colors.text === color.value && (
                          <span className="absolute right-0.5 bottom-0.5">
                            <Check size={10} className="text-blue-500" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <Label className="block mb-2">Border Color</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {colorOptions.borders.slice(0, 14).map((color) => (
                      <div
                        key={color.value}
                        className={`
                          w-8 h-8 rounded-md cursor-pointer relative border-2 border-gray-200
                          hover:scale-110 transition-transform
                          ${
                            customizationOptions.colors.border === color.value
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                        `}
                        title={color.label}
                        onClick={() =>
                          updateCustomization("colors", "border", color.value)
                        }
                      >
                        <div
                          className={`absolute inset-2 rounded-sm border-2 ${color.value.replace(
                            "border-",
                            "border-"
                          )}`}
                        ></div>
                        {customizationOptions.colors.border === color.value && (
                          <span className="absolute right-0.5 bottom-0.5">
                            <Check size={10} className="text-blue-500" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Typography Section */}
          <AccordionItem
            value="typography"
            className="border rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              Typography
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Text Size */}
                <div>
                  <Label className="block mb-2">Text Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {typographyOptions.sizes.map((size) => (
                      <Button
                        key={size.value}
                        variant={
                          customizationOptions.typography.size === size.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization("typography", "size", size.value)
                        }
                        className="justify-start"
                      >
                        <span className={size.value}>{size.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Font Weight */}
                <div>
                  <Label className="block mb-2">Font Weight</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {typographyOptions.weights.slice(0, 6).map((weight) => (
                      <Button
                        key={weight.value}
                        variant={
                          customizationOptions.typography.weight ===
                          weight.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization(
                            "typography",
                            "weight",
                            weight.value
                          )
                        }
                        className="justify-start"
                      >
                        <span className={weight.value}>{weight.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <Label className="block mb-2">Text Alignment</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {typographyOptions.alignments.map((alignment) => (
                      <Button
                        key={alignment.value}
                        variant={
                          customizationOptions.typography.alignment ===
                          alignment.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization(
                            "typography",
                            "alignment",
                            alignment.value
                          )
                        }
                      >
                        {alignment.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Spacing Section */}
          <AccordionItem
            value="spacing"
            className="border rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              Spacing
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Padding X */}
                <div>
                  <Label className="block mb-2">Horizontal Padding</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {spacingOptions.paddingX.slice(0, 8).map((padding) => (
                      <Button
                        key={padding.value}
                        variant={
                          customizationOptions.spacing.padding.x ===
                          padding.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization(
                            "spacing",
                            "padding.x",
                            padding.value
                          )
                        }
                      >
                        {padding.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Padding Y */}
                <div>
                  <Label className="block mb-2">Vertical Padding</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {spacingOptions.paddingY.slice(0, 8).map((padding) => (
                      <Button
                        key={padding.value}
                        variant={
                          customizationOptions.spacing.padding.y ===
                          padding.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization(
                            "spacing",
                            "padding.y",
                            padding.value
                          )
                        }
                      >
                        {padding.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Margin X */}
                <div>
                  <Label className="block mb-2">Horizontal Margin</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {spacingOptions.marginX.slice(0, 8).map((margin) => (
                      <Button
                        key={margin.value}
                        variant={
                          customizationOptions.spacing.margin.x === margin.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization(
                            "spacing",
                            "margin.x",
                            margin.value
                          )
                        }
                      >
                        {margin.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Borders Section */}
          <AccordionItem
            value="borders"
            className="border rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              Borders
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Border Width */}
                <div>
                  <Label className="block mb-2">Border Width</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {borderOptions.widths.map((width) => (
                      <Button
                        key={width.value}
                        variant={
                          customizationOptions.borders.width === width.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization("borders", "width", width.value)
                        }
                      >
                        {width.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <Label className="block mb-2">Border Radius</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {borderOptions.radii.slice(0, 6).map((radius) => (
                      <Button
                        key={radius.value}
                        variant={
                          customizationOptions.borders.radius === radius.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization("borders", "radius", radius.value)
                        }
                      >
                        {radius.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Effects Section */}
          <AccordionItem
            value="effects"
            className="border rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              Effects
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Shadows */}
                <div>
                  <Label className="block mb-2">Shadow</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {shadowOptions.types.slice(0, 6).map((shadow) => (
                      <Button
                        key={shadow.value}
                        variant={
                          customizationOptions.shadows.type === shadow.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCustomization("shadows", "type", shadow.value)
                        }
                      >
                        {shadow.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
