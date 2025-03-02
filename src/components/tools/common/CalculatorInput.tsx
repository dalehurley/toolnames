import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalculatorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const CalculatorInput: React.FC<CalculatorInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CalculatorInput;
