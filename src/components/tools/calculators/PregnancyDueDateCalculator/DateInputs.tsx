import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateInputsProps {
  lmpDate: string;
  conceptionDate: string;
  useConceptionDate: boolean;
  lmpError?: string;
  conceptionError?: string;
  onLmpChange: (value: string) => void;
  onConceptionChange: (value: string) => void;
  onToggleMode: (useConceptionDate: boolean) => void;
}

export const DateInputs = ({
  lmpDate,
  conceptionDate,
  useConceptionDate,
  lmpError,
  conceptionError,
  onLmpChange,
  onConceptionChange,
  onToggleMode,
}: DateInputsProps) => {
  return (
    <Tabs
      value={useConceptionDate ? "conception" : "lmp"}
      onValueChange={(value) => onToggleMode(value === "conception")}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="lmp">Last menstrual period</TabsTrigger>
        <TabsTrigger value="conception">Conception date</TabsTrigger>
      </TabsList>

      <TabsContent value="lmp" className="space-y-3 pt-4">
        <div className="space-y-2">
          <Label htmlFor="lmp-date">LMP date</Label>
          <Input
            id="lmp-date"
            type="date"
            value={lmpDate}
            onChange={(e) => onLmpChange(e.target.value)}
          />
          {lmpError && <p className="text-sm text-red-500">{lmpError}</p>}
        </div>
      </TabsContent>

      <TabsContent value="conception" className="space-y-3 pt-4">
        <div className="space-y-2">
          <Label htmlFor="conception-date">Conception date</Label>
          <Input
            id="conception-date"
            type="date"
            value={conceptionDate}
            onChange={(e) => onConceptionChange(e.target.value)}
          />
          {conceptionError && (
            <p className="text-sm text-red-500">{conceptionError}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          We estimate your LMP as 14 days before conception for due date
          calculations.
        </p>
      </TabsContent>
    </Tabs>
  );
};
