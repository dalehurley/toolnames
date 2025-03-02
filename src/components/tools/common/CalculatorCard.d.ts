import React from "react";
interface CalculatorCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}
declare const CalculatorCard: React.FC<CalculatorCardProps>;
export default CalculatorCard;
