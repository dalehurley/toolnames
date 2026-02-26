import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Assignment } from "./gradeUtils";

interface AssignmentInputsProps {
  assignments: Assignment[];
  onAssignmentsChange: (assignments: Assignment[]) => void;
}

export const AssignmentInputs = ({
  assignments,
  onAssignmentsChange,
}: AssignmentInputsProps) => {
  const [newAssignment, setNewAssignment] = useState<Assignment>({
    name: "",
    score: 0,
    maxScore: 100,
    weight: 0,
    category: "",
  });

  const addAssignment = () => {
    if (newAssignment.name && newAssignment.weight > 0) {
      onAssignmentsChange([...assignments, newAssignment]);
      setNewAssignment({
        name: "",
        score: 0,
        maxScore: 100,
        weight: 0,
        category: "",
      });
    }
  };

  const removeAssignment = (index: number) => {
    onAssignmentsChange(assignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (
    index: number,
    field: keyof Assignment,
    value: string | number,
  ) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };
    onAssignmentsChange(updated);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Add Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="assignment-name">Name</Label>
            <Input
              id="assignment-name"
              value={newAssignment.name}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, name: e.target.value })
              }
              placeholder="Midterm Exam"
            />
          </div>
          <div>
            <Label htmlFor="assignment-score">Score</Label>
            <Input
              id="assignment-score"
              type="number"
              value={newAssignment.score}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  score: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="85"
            />
          </div>
          <div>
            <Label htmlFor="assignment-max">Max Score</Label>
            <Input
              id="assignment-max"
              type="number"
              value={newAssignment.maxScore}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  maxScore: parseFloat(e.target.value) || 100,
                })
              }
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="assignment-weight">Weight (%)</Label>
            <Input
              id="assignment-weight"
              type="number"
              value={newAssignment.weight}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  weight: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="30"
            />
          </div>
          <div>
            <Label htmlFor="assignment-category">Category</Label>
            <Input
              id="assignment-category"
              value={newAssignment.category}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, category: e.target.value })
              }
              placeholder="Exams"
            />
          </div>
        </div>
        <Button onClick={addAssignment} className="mt-4" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </Card>

      {assignments.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Your Assignments</h3>
          <div className="space-y-2 overflow-x-auto">
            <div className="min-w-150">
              <div className="grid grid-cols-6 gap-2 font-semibold text-sm mb-2 pb-2 border-b">
                <div>Name</div>
                <div>Score</div>
                <div>Max</div>
                <div>Weight (%)</div>
                <div>Category</div>
                <div>Actions</div>
              </div>
              {assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-2 items-center py-2 border-b"
                >
                  <Input
                    value={assignment.name}
                    onChange={(e) =>
                      updateAssignment(index, "name", e.target.value)
                    }
                    className="h-8"
                  />
                  <Input
                    type="number"
                    value={assignment.score}
                    onChange={(e) =>
                      updateAssignment(
                        index,
                        "score",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-8"
                  />
                  <Input
                    type="number"
                    value={assignment.maxScore}
                    onChange={(e) =>
                      updateAssignment(
                        index,
                        "maxScore",
                        parseFloat(e.target.value) || 100,
                      )
                    }
                    className="h-8"
                  />
                  <Input
                    type="number"
                    value={assignment.weight}
                    onChange={(e) =>
                      updateAssignment(
                        index,
                        "weight",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-8"
                  />
                  <Input
                    value={assignment.category || ""}
                    onChange={(e) =>
                      updateAssignment(index, "category", e.target.value)
                    }
                    className="h-8"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAssignment(index)}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
