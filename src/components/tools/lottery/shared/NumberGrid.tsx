import React from "react";
import { LotteryBall } from "./LotteryBall";
import { NumberFrequency } from "./LotteryTypes";

export interface NumberGridProps {
  data: NumberFrequency[];
  rows?: number;
  columns?: number;
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  data,
  rows = 5,
  columns = 10,
}) => {
  // Create a grid layout based on the frequency data
  const grid: NumberFrequency[][] = [];

  // Determine the optimal number of rows and columns if not specified
  const totalItems = data.length;
  const actualColumns = columns || Math.ceil(totalItems / rows);
  const actualRows = rows || Math.ceil(totalItems / actualColumns);

  // Create empty grid
  for (let i = 0; i < actualRows; i++) {
    grid.push([]);
  }

  // Fill grid with data by rows
  data.forEach((item, index) => {
    const rowIndex = Math.floor(index / actualColumns);
    if (rowIndex < actualRows) {
      grid[rowIndex].push(item);
    }
  });

  return (
    <div className="number-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap gap-2 mb-2">
          {row.map((item) => (
            <LotteryBall
              key={item.number}
              number={item.number}
              type={
                item.isHot
                  ? "hot"
                  : item.isCold
                  ? "cold"
                  : item.isOverdue
                  ? "overdue"
                  : "main"
              }
              tooltip={`Drawn ${item.frequency} times`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
