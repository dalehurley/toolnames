import React from "react";
import { Button } from "@/components/ui/button";

interface CalculatorButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
};

export default CalculatorButton;
