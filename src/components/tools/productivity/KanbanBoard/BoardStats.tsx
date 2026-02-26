import { useMemo } from "react";
import { KanbanBoard } from "@/types/kanban";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BoardStatsProps {
  board: KanbanBoard;
  onClose: () => void;
}

export const BoardStats = ({ board, onClose }: BoardStatsProps) => {
  // Calculate various stats
  const stats = useMemo(() => {
    const totalCards = Object.keys(board.cards).length;
    const cardsPerColumn = board.columns.map((column) => ({
      name: column.title,
      count: column.cardIds.length,
      percentage: totalCards
        ? Math.round((column.cardIds.length / totalCards) * 100)
        : 0,
    }));

    // Priority distribution
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    Object.values(board.cards).forEach((card) => {
      priorityCounts[card.priority]++;
    });

    const priorityDistribution = Object.entries(priorityCounts).map(
      ([priority, count]) => ({
        priority,
        count,
        percentage: totalCards ? Math.round((count / totalCards) * 100) : 0,
      })
    );

    // Tags count
    const tagsCount: Record<string, number> = {};
    Object.values(board.cards).forEach((card) => {
      card.tags.forEach((tag) => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: totalCards ? Math.round((count / totalCards) * 100) : 0,
      }));

    // Checklist completion rate
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;

    Object.values(board.cards).forEach((card) => {
      if (card.checklist && card.checklist.length > 0) {
        totalChecklistItems += card.checklist.length;
        completedChecklistItems += card.checklist.filter(
          (item) => item.checked
        ).length;
      }
    });

    const checklistCompletionRate = totalChecklistItems
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
      : 0;

    // Cards with due dates
    const cardsWithDueDate = Object.values(board.cards).filter(
      (card) => card.dueDate
    ).length;
    const dueDatePercentage = totalCards
      ? Math.round((cardsWithDueDate / totalCards) * 100)
      : 0;

    // Cards with assignees
    const cardsWithAssignee = Object.values(board.cards).filter(
      (card) => card.assignee
    ).length;
    const assigneePercentage = totalCards
      ? Math.round((cardsWithAssignee / totalCards) * 100)
      : 0;

    // Overdue cards
    const now = new Date();
    const overdueCards = Object.values(board.cards).filter(
      (card) => card.dueDate && new Date(card.dueDate) < now
    ).length;

    // Story points
    const cardsWithPoints = Object.values(board.cards).filter(
      (card) => card.storyPoints !== undefined && card.storyPoints !== null
    );
    const totalStoryPoints = cardsWithPoints.reduce(
      (sum, card) => sum + (card.storyPoints ?? 0),
      0
    );

    return {
      totalCards,
      cardsPerColumn,
      priorityDistribution,
      topTags,
      checklistCompletionRate,
      cardsWithDueDate,
      dueDatePercentage,
      cardsWithAssignee,
      assigneePercentage,
      overdueCards,
      totalStoryPoints,
    };
  }, [board]);

  // Get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="mt-4 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-8 w-8 p-0"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-2">
        <div className="flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          <CardTitle>Board Statistics</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Column Distribution */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Cards Per Column</h3>
            <div className="space-y-3">
              {stats.cardsPerColumn.map((column) => (
                <div key={column.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{column.name}</span>
                    <span>
                      {column.count} ({column.percentage}%)
                    </span>
                  </div>
                  <Progress value={column.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Priority Distribution</h3>
            <div className="space-y-3">
              {stats.priorityDistribution.map((item) => (
                <div key={item.priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{item.priority}</span>
                    <span>
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    className={`h-2 ${getPriorityColor(item.priority)}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Summary</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div className="text-2xl font-bold">{stats.totalCards}</div>
                <div className="text-xs text-gray-500">Total Cards</div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div className="text-2xl font-bold">
                  {stats.checklistCompletionRate}%
                </div>
                <div className="text-xs text-gray-500">Tasks Completed</div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div className="text-2xl font-bold">
                  {stats.dueDatePercentage}%
                </div>
                <div className="text-xs text-gray-500">With Due Date</div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div className="text-2xl font-bold">
                  {stats.assigneePercentage}%
                </div>
                <div className="text-xs text-gray-500">Assigned</div>
              </div>

              <div className={`p-2 rounded ${stats.overdueCards > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                <div className={`text-2xl font-bold ${stats.overdueCards > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {stats.overdueCards}
                </div>
                <div className="text-xs text-gray-500">Overdue Cards</div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div className="text-2xl font-bold">
                  {stats.totalStoryPoints}
                </div>
                <div className="text-xs text-gray-500">Total Story Points</div>
              </div>
            </div>
          </div>

          {/* Top Tags */}
          {stats.topTags.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
              <h3 className="text-sm font-medium">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map((tag) => (
                  <Badge
                    key={tag.tag}
                    variant="secondary"
                    className="flex gap-2 items-center"
                  >
                    {tag.tag}
                    <span className="bg-gray-200 dark:bg-gray-700 text-xs rounded-full px-1.5 py-0.5">
                      {tag.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
