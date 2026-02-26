import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  LinkIcon,
  ImageIcon,
  CodeIcon,
  QuoteIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  TableIcon,
  CheckSquareIcon,
  MinusIcon,
} from "lucide-react";

interface MarkdownToolbarProps {
  onAction: (template: string) => void;
}

type ToolbarItem = {
  icon: React.ReactNode;
  label: string;
  template: string;
  shortcut?: string;
};

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onAction,
}) => {
  const toolbarGroups: ToolbarItem[][] = [
    // Headings
    [
      {
        icon: <Heading1Icon className="h-4 w-4" />,
        label: "Heading 1",
        template: "# $selection",
        shortcut: "Ctrl+1",
      },
      {
        icon: <Heading2Icon className="h-4 w-4" />,
        label: "Heading 2",
        template: "## $selection",
        shortcut: "Ctrl+2",
      },
      {
        icon: <Heading3Icon className="h-4 w-4" />,
        label: "Heading 3",
        template: "### $selection",
        shortcut: "Ctrl+3",
      },
    ],
    // Formatting
    [
      {
        icon: <BoldIcon className="h-4 w-4" />,
        label: "Bold",
        template: "**$selection**",
        shortcut: "Ctrl+B",
      },
      {
        icon: <ItalicIcon className="h-4 w-4" />,
        label: "Italic",
        template: "*$selection*",
        shortcut: "Ctrl+I",
      },
      {
        icon: <StrikethroughIcon className="h-4 w-4" />,
        label: "Strikethrough",
        template: "~~$selection~~",
      },
    ],
    // Lists
    [
      {
        icon: <ListIcon className="h-4 w-4" />,
        label: "Bullet List",
        template: "- $selection",
      },
      {
        icon: <ListOrderedIcon className="h-4 w-4" />,
        label: "Numbered List",
        template: "1. $selection",
      },
      {
        icon: <CheckSquareIcon className="h-4 w-4" />,
        label: "Task List",
        template: "- [ ] $selection",
      },
    ],
    // Links and media
    [
      {
        icon: <LinkIcon className="h-4 w-4" />,
        label: "Link",
        template: "[$selection](url)",
        shortcut: "Ctrl+K",
      },
      {
        icon: <ImageIcon className="h-4 w-4" />,
        label: "Image",
        template: "![$selection](url)",
      },
    ],
    // Code and quotes
    [
      {
        icon: <CodeIcon className="h-4 w-4" />,
        label: "Inline Code",
        template: "`$selection`",
      },
      {
        icon: <CodeIcon className="h-4 w-4" />,
        label: "Code Block",
        template: "```\n$selection\n```",
      },
      {
        icon: <QuoteIcon className="h-4 w-4" />,
        label: "Blockquote",
        template: "> $selection",
      },
    ],
    // Table and divider
    [
      {
        icon: <TableIcon className="h-4 w-4" />,
        label: "Table",
        template:
          "| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |",
      },
      {
        icon: <MinusIcon className="h-4 w-4" />,
        label: "Horizontal Rule",
        template: "\n---\n",
      },
    ],
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1 bg-muted/30 border rounded-md">
      {toolbarGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-8" />
          )}
          <div className="flex items-center">
            {group.map((item, itemIndex) => (
              <TooltipProvider key={itemIndex}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onAction(item.template)}
                    >
                      {item.icon}
                      <span className="sr-only">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
