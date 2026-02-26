import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { KanbanCard, CardTemplate } from "@/types/kanban";
import { nanoid } from "nanoid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookmarkIcon } from "lucide-react";

type CardFormData = Omit<KanbanCard, "id" | "createdAt">;

interface NewCardFormProps {
  onSubmit: (data: CardFormData) => void;
  onCancel: () => void;
  onSaveTemplate?: (template: CardTemplate) => void;
}

const NewCardForm = ({
  onSubmit,
  onCancel,
  onSaveTemplate,
}: NewCardFormProps) => {
  const [formData, setFormData] = useState<CardFormData>({
    title: "",
    description: "",
    priority: "medium",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("Task");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If saving as template and template name is provided
    if (saveAsTemplate && templateName.trim() && onSaveTemplate) {
      const newTemplate: CardTemplate = {
        id: `template-${nanoid(6)}`,
        name: templateName.trim(),
        description: `Template created from card "${formData.title}"`,
        category: templateCategory,
        cardData: { ...formData },
      };

      onSaveTemplate(newTemplate);
    }

    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      priority: value as "low" | "medium" | "high",
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Default template name based on card title
  const updateTemplateName = () => {
    if (!templateName && formData.title) {
      setTemplateName(`${formData.title.split(":")[0]} Template`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Card title"
            required
            onBlur={updateTemplateName}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Card description"
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            onValueChange={handlePriorityChange}
            defaultValue={formData.priority}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignee">Assignee (optional)</Label>
          <Input
            id="assignee"
            name="assignee"
            value={formData.assignee || ""}
            onChange={handleChange}
            placeholder="Assignee name"
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date (optional)</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={
              formData.dueDate
                ? new Date(formData.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="storyPoints">Story Points (optional)</Label>
          <Input
            id="storyPoints"
            type="number"
            min="0"
            max="999"
            value={formData.storyPoints ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({
                ...prev,
                storyPoints: val === "" ? undefined : Number(val),
              }));
            }}
            placeholder="e.g. 3, 5, 8"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="flex space-x-2">
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded px-2 py-1 flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Save as Template Option */}
        {onSaveTemplate && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="save-template"
                checked={saveAsTemplate}
                onCheckedChange={(checked) =>
                  setSaveAsTemplate(checked === true)
                }
              />
              <Label
                htmlFor="save-template"
                className="font-medium cursor-pointer"
              >
                <div className="flex items-center">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Save as Template
                </div>
              </Label>
            </div>

            {saveAsTemplate && (
              <div className="space-y-4 pl-6">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    required={saveAsTemplate}
                  />
                </div>

                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={templateCategory}
                    onValueChange={setTemplateCategory}
                  >
                    <SelectTrigger id="template-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Feature">Feature</SelectItem>
                      <SelectItem value="Documentation">
                        Documentation
                      </SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {saveAsTemplate ? "Create Card & Save Template" : "Create Card"}
        </Button>
      </div>
    </form>
  );
};

export default NewCardForm;
