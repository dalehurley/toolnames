import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const ToolCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: ToolCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Tool content can be expanded here if needed */}
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          Launch Tool
        </Button>
      </CardFooter>
    </Card>
  );
};
