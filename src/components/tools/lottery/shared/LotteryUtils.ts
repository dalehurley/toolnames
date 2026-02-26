import { LotteryConfig } from './LotteryTypes';

/**
 * Generates random unique numbers within a specified range
 * 
 * @param count Number of numbers to generate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @param excludedNumbers Optional array of numbers to exclude from generation
 * @returns Array of unique random numbers sorted in ascending order
 */
export function generateRandomNumbers(
  count: number,
  min: number,
  max: number,
  excludedNumbers: number[] = []
): number[] {
  // Adjust available numbers based on excluded numbers
  const availableCount = (max - min + 1) - excludedNumbers.filter(n => n >= min && n <= max).length;
  
  if (count > availableCount) {
    throw new Error(`Cannot generate ${count} unique numbers in the range ${min}-${max} excluding ${excludedNumbers.length} numbers`);
  }

  const numbers = new Set<number>();
  
  while (numbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!excludedNumbers.includes(randomNumber) && !numbers.has(randomNumber)) {
      numbers.add(randomNumber);
    }
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Format odds as a readable string
 */
export const formatOdds = (odds: number): string => {
  if (odds === 0) return "N/A";
  return `1 in ${odds.toLocaleString()}`;
};

/**
 * Format large numbers in a readable way
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)} billion`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} million`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} thousand`;
  }
  return value.toString();
};

/**
 * Get a comparison for odds to make them more relatable
 */
export const getOddsComparison = (odds: number): string => {
  if (odds >= 1e9) {
    return "Being struck by lightning while holding a winning lottery ticket";
  } else if (odds >= 5e8) {
    return "Being struck by lightning twice in your lifetime";
  } else if (odds >= 1e8) {
    return "Being struck by lightning while celebrating your 100th birthday";
  } else if (odds >= 5e7) {
    return "Being struck by lightning in your lifetime";
  } else if (odds >= 1e7) {
    return "Being dealt a royal flush in poker on your first hand";
  } else if (odds >= 5e6) {
    return "Being dealt a royal flush in poker";
  } else if (odds >= 1e6) {
    return "Finding a specific grain of sand on a beach";
  } else if (odds >= 5e5) {
    return "Being in a plane crash";
  } else if (odds >= 1e5) {
    return "Being born with extra fingers or toes";
  } else if (odds >= 5e4) {
    return "Being struck by lightning in a given year";
  } else if (odds >= 1e4) {
    return "Bowling a perfect 300 game as an amateur";
  } else if (odds >= 5e3) {
    return "Finding a four-leaf clover on your first try";
  } else if (odds >= 1e3) {
    return "Flipping a coin and getting 10 heads in a row";
  } else if (odds >= 5e2) {
    return "Rolling a specific number on a die 4 times in a row";
  } else if (odds >= 1e2) {
    return "Rolling snake eyes (two 1s) with two dice";
  } else {
    return "Flipping a coin and getting 6 heads in a row";
  }
};

/**
 * Generate numbers based on a strategy
 */
export const generateStrategyNumbers = (
  config: LotteryConfig,
  strategy: 'random' | 'balanced' | 'hot-cold' | 'pattern',
  hotNumbers: number[] = [],
  coldNumbers: number[] = []
): { main: number[]; bonus: number[] } => {
  const mainCount = config.mainNumbers.count;
  const mainMin = config.mainNumbers.min;
  const mainMax = config.mainNumbers.max;
  
  let mainNumbers: number[] = [];
  
  // Variables used in multiple cases
  let midpoint: number;
  let evenCount: number;
  let highCount: number;
  let evenNumbers: number[];
  let oddNumbers: number[];
  let currentHighCount: number;
  let lowIndices: number[];
  let highIndices: number[];
  let indexToSwap: number;
  let newNumber: number;
  let selectedHot: number[];
  let selectedCold: number[];
  let patternType: string;
  let start: number;
  let spacing: number;
  
  switch (strategy) {
    case 'balanced':
      // Generate balanced numbers (even/odd, high/low)
      midpoint = Math.floor((mainMax + mainMin) / 2);
      evenCount = Math.floor(mainCount / 2);
      highCount = Math.floor(mainCount / 2);
      
      // Generate even numbers
      evenNumbers = generateRandomNumbers(
        evenCount,
        Math.ceil(mainMin / 2) * 2, // First even number
        Math.floor(mainMax / 2) * 2 // Last even number
      );
      
      // Generate odd numbers
      oddNumbers = generateRandomNumbers(
        mainCount - evenCount,
        mainMin % 2 === 1 ? mainMin : mainMin + 1, // First odd number
        mainMax % 2 === 1 ? mainMax : mainMax - 1, // Last odd number
      );
      
      // Combine and sort
      mainNumbers = [...evenNumbers, ...oddNumbers].sort((a, b) => a - b);
      
      // Ensure high/low balance by swapping if needed
      currentHighCount = mainNumbers.filter(n => n > midpoint).length;
      
      while (currentHighCount !== highCount) {
        if (currentHighCount < highCount) {
          // Need more high numbers - find a low to swap
          lowIndices = mainNumbers
            .map((n, i) => n <= midpoint ? i : -1)
            .filter(i => i !== -1);
          
          if (lowIndices.length > 0) {
            indexToSwap = lowIndices[Math.floor(Math.random() * lowIndices.length)];
            do {
              newNumber = Math.floor(Math.random() * (mainMax - midpoint)) + midpoint + 1;
            } while (mainNumbers.includes(newNumber));
            
            mainNumbers[indexToSwap] = newNumber;
          }
        } else {
          // Need more low numbers - find a high to swap
          highIndices = mainNumbers
            .map((n, i) => n > midpoint ? i : -1)
            .filter(i => i !== -1);
          
          if (highIndices.length > 0) {
            indexToSwap = highIndices[Math.floor(Math.random() * highIndices.length)];
            do {
              newNumber = Math.floor(Math.random() * (midpoint - mainMin + 1)) + mainMin;
            } while (mainNumbers.includes(newNumber));
            
            mainNumbers[indexToSwap] = newNumber;
          }
        }
        
        currentHighCount = mainNumbers.filter(n => n > midpoint).length;
      }
      
      mainNumbers.sort((a, b) => a - b);
      break;
      
    case 'hot-cold':
      // Use hot and cold numbers if provided
      if (hotNumbers.length >= Math.ceil(mainCount / 2) && coldNumbers.length >= Math.floor(mainCount / 2)) {
        // Take half from hot numbers
        selectedHot = hotNumbers
          .slice(0, Math.ceil(mainCount / 2));
        
        // Take half from cold numbers
        selectedCold = coldNumbers
          .slice(0, Math.floor(mainCount / 2));
        
        mainNumbers = [...selectedHot, ...selectedCold].sort((a, b) => a - b);
      } else {
        // Fallback to random if not enough hot/cold numbers
        mainNumbers = generateRandomNumbers(mainCount, mainMin, mainMax);
      }
      break;
      
    case 'pattern':
      // Generate numbers with patterns (consecutive, evenly spaced)
      patternType = Math.random() < 0.5 ? 'consecutive' : 'spaced';
      
      if (patternType === 'consecutive') {
        // Include at least one consecutive pair
        start = Math.floor(Math.random() * (mainMax - mainMin - mainCount)) + mainMin;
        mainNumbers = [start, start + 1];
        
        // Fill the rest with random numbers
        while (mainNumbers.length < mainCount) {
          const num = Math.floor(Math.random() * (mainMax - mainMin + 1)) + mainMin;
          if (!mainNumbers.includes(num)) {
            mainNumbers.push(num);
          }
        }
      } else {
        // Evenly spaced numbers
        start = Math.floor(Math.random() * (mainMin + 5)) + mainMin;
        spacing = Math.floor((mainMax - start) / mainCount);
        
        mainNumbers = Array.from(
          { length: mainCount },
          (_, i) => start + i * spacing
        );
      }
      
      mainNumbers.sort((a, b) => a - b);
      break;
      
    case 'random':
    default:
      // Completely random
      mainNumbers = generateRandomNumbers(mainCount, mainMin, mainMax);
      break;
  }
  
  // Generate bonus numbers if needed
  let bonusNumbers: number[] = [];
  if (config.bonusNumbers) {
    bonusNumbers = generateRandomNumbers(
      config.bonusNumbers.count,
      config.bonusNumbers.min,
      config.bonusNumbers.max
    );
  }
  
  return { main: mainNumbers, bonus: bonusNumbers };
}; 