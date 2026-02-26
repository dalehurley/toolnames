import React from "react";
import { Button } from "@/components/ui/button";
import {
  Paintbrush,
  MousePointer,
  Focus,
  MousePointerClick,
  BrainCircuit,
} from "lucide-react";
import { ComponentState } from "../hooks/useComponentStates";

interface StateSelectorProps {
  activeState: ComponentState;
  setActiveState: (state: ComponentState) => void;
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  activeState,
  setActiveState,
}) => {
  const states: { id: ComponentState; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "default",
        label: "Default",
        icon: <Paintbrush size={16} />,
      },
      {
        id: "hover",
        label: "Hover",
        icon: <MousePointer size={16} />,
      },
      {
        id: "focus",
        label: "Focus",
        icon: <Focus size={16} />,
      },
      {
        id: "active",
        label: "Active",
        icon: <MousePointerClick size={16} />,
      },
      {
        id: "disabled",
        label: "Disabled",
        icon: <BrainCircuit size={16} />,
      },
    ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Component State</div>
      <div className="flex flex-wrap gap-2">
        {states.map((state) => (
          <Button
            key={state.id}
            size="sm"
            variant={activeState === state.id ? "default" : "outline"}
            onClick={() => setActiveState(state.id)}
            className="flex items-center gap-1.5"
          >
            {state.icon}
            <span>{state.label}</span>
          </Button>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {activeState === "default" ? (
          <span>Editing the default state</span>
        ) : (
          <span>
            Customizing the <span className="font-semibold">{activeState}</span>{" "}
            state. These styles will be applied when the component is{" "}
            {activeState}.
          </span>
        )}
      </div>
    </div>
  );
};
