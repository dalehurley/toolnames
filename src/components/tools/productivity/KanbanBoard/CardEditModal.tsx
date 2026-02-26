import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { KanbanCard, CardTemplate } from "@/types/kanban";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, X, BookmarkIcon } from "lucide-react";
import { nanoid } from "nanoid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CardEditModalProps {
  card: KanbanCard;
  onSave: (data: Partial<KanbanCard>) => void;
  onCancel: () => void;
  onSaveTemplate?: (template: CardTemplate) => void;
}

const CardEditModal = ({
  card,
  onSave,
  onCancel,
  onSaveTemplate,
}: CardEditModalProps) => {
  const [formData, setFormData] = useState<KanbanCard>({ ...card });
  const [tagInput, setTagInput] = useState("");
  const [checklistItemText, setChecklistItemText] = useState("");

  // Template state
  const [showTemplateSaveDialog, setShowTemplateSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState(
    `${card.title.split(":")[0]} Template`
  );
  const [templateCategory, setTemplateCategory] = useState("Task");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  const handleAddChecklistItem = () => {
    if (!checklistItemText.trim()) return;

    const newItem = {
      id: nanoid(6),
      text: checklistItemText.trim(),
      checked: false,
    };

    setFormData((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem],
    }));

    setChecklistItemText("");
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!formData.checklist) return;

    const updatedChecklist = formData.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    setFormData((prev) => ({
      ...prev,
      checklist: updatedChecklist,
    }));
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    if (!formData.checklist) return;

    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist?.filter((item) => item.id !== itemId),
    }));
  };

  // Handle saving as a template
  const handleSaveAsTemplate = () => {
    if (!templateName.trim() || !onSaveTemplate) return;

    const templateData: Omit<KanbanCard, "id" | "createdAt"> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      tags: [...formData.tags],
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      color: formData.color,
      checklist: formData.checklist ? [...formData.checklist] : undefined,
    };

    const newTemplate: CardTemplate = {
      id: `template-${nanoid(6)}`,
      name: templateName.trim(),
      description: `Template created from card "${formData.title}"`,
      category: templateCategory,
      cardData: templateData,
    };

    onSaveTemplate(newTemplate);
    setShowTemplateSaveDialog(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Card</h3>
            <div className="flex gap-2">
              {onSaveTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center h-8"
                  onClick={() => setShowTemplateSaveDialog(true)}
                >
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  Save as Template
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddTag}
                  >
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

              <div>
                <Label>Checklist</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    value={checklistItemText}
                    onChange={(e) => setChecklistItemText(e.target.value)}
                    placeholder="Add checklist item"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddChecklistItem}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {formData.checklist && formData.checklist.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          id={`check-${item.id}`}
                          checked={item.checked}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="rounded text-primary"
                        />
                        <label
                          htmlFor={`check-${item.id}`}
                          className={`text-sm flex-1 ${
                            item.checked ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {item.text}
                        </label>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Save as Template Dialog */}
      {showTemplateSaveDialog && (
        <Dialog open={true} onOpenChange={setShowTemplateSaveDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Create a reusable template from this card
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
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
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTemplateSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAsTemplate}>Save Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CardEditModal;
