import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Course, calculateGPA } from "./gradeUtils";

export const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    credits: 3,
    grade: "A",
  });

  const [cumulativeGPA, setCumulativeGPA] = useState<number>(0);
  const [cumulativeCredits, setCumulativeCredits] = useState<number>(0);

  const semesterGPA = useMemo(() => calculateGPA(courses), [courses]);

  const totalCredits = useMemo(
    () => courses.reduce((sum, course) => sum + course.credits, 0),
    [courses],
  );

  const overallGPA = useMemo(() => {
    if (cumulativeCredits + totalCredits === 0) return 0;
    const totalPoints =
      cumulativeGPA * cumulativeCredits + semesterGPA * totalCredits;
    return totalPoints / (cumulativeCredits + totalCredits);
  }, [cumulativeGPA, cumulativeCredits, semesterGPA, totalCredits]);

  const addCourse = () => {
    if (newCourse.name && newCourse.credits > 0) {
      setCourses([...courses, newCourse]);
      setNewCourse({ name: "", credits: 3, grade: "A" });
    }
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (
    index: number,
    field: keyof Course,
    value: string | number,
  ) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const gradeOptions = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cumulative GPA (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cumulative-gpa">Previous Cumulative GPA</Label>
              <Input
                id="cumulative-gpa"
                type="number"
                step="0.01"
                value={cumulativeGPA}
                onChange={(e) =>
                  setCumulativeGPA(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your GPA from previous semesters
              </p>
            </div>
            <div>
              <Label htmlFor="cumulative-credits">
                Previous Credits Earned
              </Label>
              <Input
                id="cumulative-credits"
                type="number"
                value={cumulativeCredits}
                onChange={(e) =>
                  setCumulativeCredits(parseFloat(e.target.value) || 0)
                }
                min={0}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Total credits from previous semesters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                placeholder="Calculus I"
              />
            </div>
            <div>
              <Label htmlFor="course-credits">Credits</Label>
              <Input
                id="course-credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    credits: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                max={10}
              />
            </div>
            <div>
              <Label htmlFor="course-grade">Grade</Label>
              <Select
                value={newCourse.grade}
                onValueChange={(value) =>
                  setNewCourse({ ...newCourse, grade: value })
                }
              >
                <SelectTrigger id="course-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addCourse} className="mt-4" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </CardContent>
      </Card>

      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 overflow-x-auto">
              <div className="min-w-125">
                <div className="grid grid-cols-4 gap-2 font-semibold text-sm mb-2 pb-2 border-b">
                  <div>Course Name</div>
                  <div>Credits</div>
                  <div>Grade</div>
                  <div>Actions</div>
                </div>
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 items-center py-2 border-b"
                  >
                    <Input
                      value={course.name}
                      onChange={(e) =>
                        updateCourse(index, "name", e.target.value)
                      }
                      className="h-8"
                    />
                    <Input
                      type="number"
                      value={course.credits}
                      onChange={(e) =>
                        updateCourse(
                          index,
                          "credits",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="h-8"
                    />
                    <Select
                      value={course.grade}
                      onValueChange={(value) =>
                        updateCourse(index, "grade", value)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCourse(index)}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Semester GPA
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {semesterGPA.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {totalCredits} credits
              </div>
            </div>

            {cumulativeCredits > 0 && (
              <>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Previous GPA
                  </div>
                  <div className="text-4xl font-bold text-gray-600">
                    {cumulativeGPA.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {cumulativeCredits} credits
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    New Cumulative GPA
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {overallGPA.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {cumulativeCredits + totalCredits} total credits
                  </div>
                </div>
              </>
            )}
          </div>

          {courses.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Course Breakdown</h4>
              <div className="space-y-2 text-sm">
                {courses.map((course, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {course.name} ({course.credits} credits)
                    </span>
                    <span className="font-semibold">{course.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
