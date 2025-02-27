/**
 * Utility functions for lottery number generation
 */

/**
 * Generates random unique numbers within a specified range
 * 
 * @param count Number of numbers to generate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Array of unique random numbers sorted in ascending order
 */
export function generateRandomNumbers(
  count: number,
  min: number,
  max: number
): number[] {
  if (count > (max - min + 1)) {
    throw new Error(`Cannot generate ${count} unique numbers in the range ${min}-${max}`);
  }

  const numbers = new Set<number>();
  
  while (numbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNumber);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Predefined lottery configurations
 */
export interface LotteryConfig {
  name: string;
  mainNumbers: {
    count: number;
    min: number;
    max: number;
  };
  bonusNumbers?: {
    count: number;
    min: number;
    max: number;
  };
}

export const LOTTERY_CONFIGS: Record<string, LotteryConfig> = {
  powerball: {
    name: "Powerball",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 69
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 26
    }
  },
  megaMillions: {
    name: "Mega Millions",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 70
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 25
    }
  },
  standard: {
    name: "Standard Lottery",
    mainNumbers: {
      count: 6,
      min: 1,
      max: 49
    }
  },
  custom: {
    name: "Custom",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50
    }
  }
}; 