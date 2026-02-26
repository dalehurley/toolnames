import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Assignment } from "./gradeUtils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface GradeVisualizationsProps {
  assignments: Assignment[];
}

export const GradeVisualizations = ({
  assignments,
}: GradeVisualizationsProps) => {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Add assignments to see visualizations
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by category for pie chart
  const categoryData = assignments.reduce(
    (acc, assignment) => {
      const category = assignment.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += assignment.weight;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  // Performance data for bar visualization
  const performanceData = assignments.map((assignment) => {
    const percentage = (assignment.score / assignment.maxScore) * 100;
    return {
      name: assignment.name,
      percentage: percentage,
      weight: assignment.weight,
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Weight Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((item, index) => {
              let barColor = "bg-green-500";
              if (item.percentage < 60) barColor = "bg-red-500";
              else if (item.percentage < 70) barColor = "bg-orange-500";
              else if (item.percentage < 80) barColor = "bg-yellow-500";
              else if (item.percentage < 90) barColor = "bg-blue-500";

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.percentage.toFixed(1)}% (Weight: {item.weight}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Total Assignments
              </div>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Highest Score
              </div>
              <div className="text-2xl font-bold">
                {Math.max(
                  ...assignments.map((a) => (a.score / a.maxScore) * 100),
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Lowest Score
              </div>
              <div className="text-2xl font-bold">
                {Math.min(
                  ...assignments.map((a) => (a.score / a.maxScore) * 100),
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Average Score
              </div>
              <div className="text-2xl font-bold">
                {(
                  assignments.reduce(
                    (sum, a) => sum + (a.score / a.maxScore) * 100,
                    0,
                  ) / assignments.length
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
