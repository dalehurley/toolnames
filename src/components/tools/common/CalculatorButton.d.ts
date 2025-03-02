import React from "react";
interface CalculatorButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}
declare const CalculatorButton: React.FC<CalculatorButtonProps>;
export default CalculatorButton;
