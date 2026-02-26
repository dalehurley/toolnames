import React from "react";

export interface LotteryBallProps {
  number: number;
  type?: "main" | "bonus" | "hot" | "cold" | "overdue" | "default";
  size?: "xs" | "sm" | "md" | "lg";
  isHot?: boolean;
  isCold?: boolean;
  isOverdue?: boolean;
  isSelected?: boolean;
  animationDelay?: number;
  tooltip?: string;
  onClick?: () => void;
  is3D?: boolean;
}

/**
 * Animated lottery ball component
 */
export const LotteryBall: React.FC<LotteryBallProps> = ({
  number,
  type = "main",
  size = "md",
  isHot,
  isCold,
  isOverdue,
  isSelected,
  animationDelay,
  tooltip,
  onClick,
  is3D = false,
}) => {
  // Determine the styling based on type, size, and status flags
  let bgColor = "bg-primary";
  let textColor = "text-primary-foreground";

  // Prioritize type over flags
  if (type === "bonus") {
    bgColor = "bg-yellow-500";
    textColor = "text-white";
  } else if (type === "hot" || isHot) {
    bgColor = "bg-red-500";
    textColor = "text-white";
  } else if (type === "cold" || isCold) {
    bgColor = "bg-blue-500";
    textColor = "text-white";
  } else if (type === "overdue" || isOverdue) {
    bgColor = "bg-amber-500";
    textColor = "text-white";
  } else if (type === "default") {
    bgColor = "bg-slate-200 dark:bg-slate-700";
    textColor = "text-slate-900 dark:text-slate-100";
  }

  if (isSelected) {
    bgColor = "bg-green-500";
    textColor = "text-white";
  }

  // Set size classes
  let sizeClasses = "h-8 w-8 text-sm";
  if (size === "xs") {
    sizeClasses = "h-6 w-6 text-xs";
  } else if (size === "sm") {
    sizeClasses = "h-7 w-7 text-xs";
  } else if (size === "lg") {
    sizeClasses = "h-10 w-10 text-base";
  }

  // Style for animation delay if provided
  const animationStyle =
    animationDelay !== undefined
      ? { animationDelay: `${animationDelay}s` }
      : {};

  // Add 3D effect classes if is3D is true
  const threeDEffect = is3D
    ? "transform-gpu hover:scale-110 transition-transform duration-200 shadow-lg"
    : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses} ${bgColor} ${textColor} rounded-full font-semibold ${
        onClick ? "cursor-pointer" : ""
      } ${threeDEffect}`}
      title={tooltip}
      onClick={onClick}
      style={animationStyle}
    >
      {number}
    </div>
  );
};

export default LotteryBall;
