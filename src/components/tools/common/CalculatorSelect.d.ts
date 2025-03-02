import React from "react";
interface CalculatorSelectProps {
    label: string;
    options: {
        value: string;
        label: string;
    }[];
    value: string;
    onChange: (value: string) => void;
}
declare const CalculatorSelect: React.FC<CalculatorSelectProps>;
export default CalculatorSelect;
