import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, BarChart, Award, Settings } from "lucide-react";
import { HabitProvider } from "@/contexts/HabitContext";
import HabitList from "./HabitList";
import HabitForm from "./HabitForm";
import HabitCalendar from "./HabitCalendar";
import HabitStats from "./HabitStats";
import HabitAchievements from "./HabitAchievements";
import HabitSettings from "./HabitSettings";

const HabitTracker: React.FC = () => {
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [activeTab, setActiveTab] = useState("today");

  return (
    <HabitProvider>
      <div className="container mx-auto p-4">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Habit Tracker
                </CardTitle>
                <CardDescription>
                  Track your daily habits and build positive routines
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddingHabit(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> New Habit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Tabs
              defaultValue="today"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart className="mr-2 h-4 w-4" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Award className="mr-2 h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="today">
                  <HabitList onAddHabit={() => setIsAddingHabit(true)} />
                </TabsContent>

                <TabsContent value="calendar">
                  <HabitCalendar />
                </TabsContent>

                <TabsContent value="stats">
                  <HabitStats />
                </TabsContent>

                <TabsContent value="achievements">
                  <HabitAchievements />
                </TabsContent>

                <TabsContent value="settings">
                  <HabitSettings />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {isAddingHabit && (
          <HabitForm
            onClose={() => setIsAddingHabit(false)}
            onSave={() => {
              setIsAddingHabit(false);
              setActiveTab("today");
            }}
          />
        )}
      </div>
    </HabitProvider>
  );
};

export default HabitTracker;
