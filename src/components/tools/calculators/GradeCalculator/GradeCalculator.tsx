import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentInputs } from "./AssignmentInputs";
import { GradeResults } from "./GradeResults";
import { FinalExamCalculator } from "./FinalExamCalculator";
import { GPACalculator } from "./GPACalculator";
import { GradeVisualizations } from "./GradeVisualizations";
import { Assignment, calculateWeightedGrade } from "./gradeUtils";

export const GradeCalculator = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const weightedGrade = useMemo(() => {
    return calculateWeightedGrade(assignments);
  }, [assignments]);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Grade Calculator</CardTitle>
        <p className="text-muted-foreground">
          Calculate weighted grades, determine final exam requirements, and
          track your GPA
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weighted" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weighted">Weighted Grade</TabsTrigger>
            <TabsTrigger value="final">Final Exam</TabsTrigger>
            <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          </TabsList>

          <TabsContent value="weighted" className="space-y-6 mt-6">
            <AssignmentInputs
              assignments={assignments}
              onAssignmentsChange={setAssignments}
            />
            <GradeResults
              weightedGrade={weightedGrade}
              assignments={assignments}
            />
          </TabsContent>

          <TabsContent value="final" className="mt-6">
            <FinalExamCalculator />
          </TabsContent>

          <TabsContent value="gpa" className="mt-6">
            <GPACalculator />
          </TabsContent>

          <TabsContent value="visualizations" className="mt-6">
            <GradeVisualizations assignments={assignments} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
