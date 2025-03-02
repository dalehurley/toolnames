import React from "react";
interface CalculatorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}
declare const CalculatorInput: React.FC<CalculatorInputProps>;
export default CalculatorInput;
