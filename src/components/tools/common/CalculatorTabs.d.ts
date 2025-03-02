import React from "react";
interface CalculatorTabsProps {
    tabs: {
        label: string;
        content: React.ReactNode;
    }[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}
declare const CalculatorTabs: React.FC<CalculatorTabsProps>;
export default CalculatorTabs;
