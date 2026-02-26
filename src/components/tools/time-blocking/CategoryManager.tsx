import React, { useState } from "react";
import { useTimeBlocking } from "@/contexts/TimeBlockingContext";
import { Category } from "@/contexts/TimeBlockingContext";
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A color picker component for selecting category colors
const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const colors = [
    "#4f46e5", // indigo
    "#10b981", // emerald
    "#ef4444", // red
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#6366f1", // indigo
    "#9333ea", // purple
    "#f97316", // orange
    "#14b8a6", // teal
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-6 h-6 rounded-full transition-all ${
            color === value ? "ring-2 ring-offset-2 ring-gray-400" : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

const CategoryManager: React.FC = () => {
  const { state, dispatch, toggleCategoryVisibility } = useTimeBlocking();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<{ name: string; color: string }>({
    name: "",
    color: "#4f46e5",
  });

  const handleOpenAdd = () => {
    setFormData({ name: "", color: "#4f46e5" });
    setEditingCategory(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setFormData({ name: category.name, color: category.color });
    setEditingCategory(category);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      dispatch({
        type: "UPDATE_CATEGORY",
        payload: {
          ...editingCategory,
          name: formData.name,
          color: formData.color,
        },
      });
    } else {
      dispatch({
        type: "ADD_CATEGORY",
        payload: {
          id: `category-${Date.now()}`,
          name: formData.name,
          color: formData.color,
          isVisible: true,
        },
      });
    }

    setIsAddOpen(false);
  };

  const handleDelete = (categoryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All blocks in this category will be moved to the default category."
      )
    ) {
      dispatch({ type: "DELETE_CATEGORY", payload: categoryId });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Categories</h3>
        <Button size="sm" variant="ghost" onClick={handleOpenAdd}>
          <PlusCircle className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {state.categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-2"
              onClick={() => toggleCategoryVisibility(category.id)}
            >
              {category.isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>

            <Circle
              className="w-4 h-4 mr-2"
              fill={category.color}
              stroke="none"
            />

            <span
              className={`flex-1 text-sm ${
                !category.isVisible ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {category.name}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleOpenEdit(category)}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDelete(category.id)}
              disabled={state.categories.length <= 1}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Category name"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
