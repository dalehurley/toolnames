import { LotteryDraw, NumberFrequency } from './LotteryTypes';
import { LotteryConfig } from './LotteryTypes';
import { calculateCombinations } from './LotteryConfigurations';

/**
 * Calculate frequency of each number in historical draws
 */
export const calculateNumberFrequency = (
  draws: LotteryDraw[],
  config: LotteryConfig,
  numberType: 'main' | 'bonus' = 'main'
): NumberFrequency[] => {
  const min = numberType === 'main' 
    ? config.mainNumbers.min 
    : config.bonusNumbers?.min || 1;
  
  const max = numberType === 'main' 
    ? config.mainNumbers.max 
    : config.bonusNumbers?.max || 1;
  
  // Initialize frequency map with all possible numbers
  const frequencyMap: Record<number, NumberFrequency> = {};
  for (let i = min; i <= max; i++) {
    frequencyMap[i] = {
      number: i,
      frequency: 0,
      lastDrawn: undefined
    };
  }
  
  // Count occurrences in draws
  draws.forEach(draw => {
    const numbers = numberType === 'main' ? draw.mainNumbers : draw.bonusNumbers;
    numbers.forEach(num => {
      if (frequencyMap[num]) {
        frequencyMap[num].frequency += 1;
        
        // Update last drawn date if this draw is more recent
        if (!frequencyMap[num].lastDrawn || draw.date > frequencyMap[num].lastDrawn) {
          frequencyMap[num].lastDrawn = draw.date;
        }
      }
    });
  });
  
  // Convert to array and sort by frequency
  const frequencies = Object.values(frequencyMap);
  
  // Calculate hot/cold status
  if (draws.length > 0) {
    const avgFrequency = frequencies.reduce((sum, f) => sum + f.frequency, 0) / frequencies.length;
    const stdDev = Math.sqrt(
      frequencies.reduce((sum, f) => sum + Math.pow(f.frequency - avgFrequency, 2), 0) / frequencies.length
    );
    
    frequencies.forEach(f => {
      f.isHot = f.frequency > avgFrequency + stdDev * 0.5;
      f.isCold = f.frequency < avgFrequency - stdDev * 0.5;
      
      // Calculate overdue status (hasn't appeared in last 20% of draws)
      if (f.lastDrawn) {
        const sortedDates = [...draws].sort((a, b) => b.date.getTime() - a.date.getTime());
        const recentDrawsThreshold = Math.max(5, Math.floor(draws.length * 0.2));
        const recentDraws = sortedDates.slice(0, recentDrawsThreshold);
        
        if (recentDraws.length > 0) {
          const oldestRecentDraw = recentDraws[recentDraws.length - 1].date;
          f.isOverdue = f.lastDrawn < oldestRecentDraw;
        }
      }
    });
  }
  
  return frequencies.sort((a, b) => b.frequency - a.frequency);
};

/**
 * Find patterns in winning number combinations
 * 
 * @param draws Array of lottery draws to analyze
 * @param config Lottery configuration 
 * @returns Record of pattern frequencies
 */
export const findNumberPatterns = (
  draws: LotteryDraw[],
  config?: LotteryConfig
): Record<string, number> => {
  const patterns: Record<string, number> = {
    consecutive: 0,
    evenOddBalance: 0,
    highLowBalance: 0,
    sumInRange: 0,
    repeatedPairs: 0
  };
  
  if (!draws || draws.length === 0) return patterns;
  
  // Get the midpoint for high/low analysis
  let minNumber = 1;
  let maxNumber = 50;
  
  if (config && config.mainNumbers) {
    minNumber = config.mainNumbers.min;
    maxNumber = config.mainNumbers.max;
  }
  
  const midPoint = minNumber + Math.floor((maxNumber - minNumber) / 2);
  
  // Analyze each draw
  draws.forEach(draw => {
    const numbers = [...draw.mainNumbers].sort((a, b) => a - b);
    
    // Check for consecutive numbers
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] === 1) {
        patterns.consecutive++;
        break;
      }
    }
    
    // Check even/odd balance
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    if (Math.abs(evenCount - oddCount) <= 1) {
      patterns.evenOddBalance++;
    }
    
    // Check high/low balance
    const highCount = numbers.filter(n => n > midPoint).length;
    const lowCount = numbers.length - highCount;
    if (Math.abs(highCount - lowCount) <= 1) {
      patterns.highLowBalance++;
    }
    
    // Check sum in typical range
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const expectedMean = (minNumber + maxNumber) / 2;
    const expectedSum = expectedMean * numbers.length;
    const tolerance = expectedSum * 0.2;
    if (Math.abs(sum - expectedSum) <= tolerance) {
      patterns.sumInRange++;
    }
    
    // Check for repeated pairs from previous draws
    for (let i = 0; i < draws.length; i++) {
      if (draws[i].date >= draw.date) continue; // Skip current or future draws
      
      const prevNumbers = draws[i].mainNumbers;
      for (let j = 0; j < numbers.length - 1; j++) {
        for (let k = j + 1; k < numbers.length; k++) {
          const pair = [numbers[j], numbers[k]];
          if (
            prevNumbers.includes(pair[0]) && 
            prevNumbers.includes(pair[1])
          ) {
            patterns.repeatedPairs++;
            break;
          }
        }
      }
    }
  });
  
  // Convert to percentages
  Object.keys(patterns).forEach(key => {
    patterns[key] = Math.round((patterns[key] / draws.length) * 100);
  });
  
  return patterns;
};

/**
 * Generate a wheeling system
 */
export const generateWheelingSystem = (
  numbers: number[],
  type: 'full' | 'abbreviated' | 'key',
  count: number,
  keyNumbers: number[] = []
): number[][] => {
  if (type === 'full') {
    return generateFullWheel(numbers, count);
  } else if (type === 'abbreviated') {
    return generateAbbreviatedWheel(numbers, count);
  } else {
    return generateKeyNumberWheel(numbers, count, keyNumbers);
  }
};

/**
 * Generate a full wheeling system (all possible combinations)
 */
const generateFullWheel = (numbers: number[], count: number): number[][] => {
  const result: number[][] = [];
  
  const generateCombinations = (
    current: number[],
    start: number,
    remaining: number
  ) => {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i <= numbers.length - remaining; i++) {
      current.push(numbers[i]);
      generateCombinations(current, i + 1, remaining - 1);
      current.pop();
    }
  };
  
  generateCombinations([], 0, count);
  return result;
};

/**
 * Generate an abbreviated wheeling system (reduced combinations)
 */
const generateAbbreviatedWheel = (numbers: number[], count: number): number[][] => {
  if (numbers.length <= count) {
    return [numbers];
  }
  
  // This is a simplified implementation - real abbreviated wheels
  // use mathematical techniques to guarantee certain matches
  const result: number[][] = [];
  const totalCombinations = calculateCombinations(numbers.length, count);
  
  // Generate about 20% of the full wheel combinations
  const targetCombinations = Math.max(5, Math.ceil(totalCombinations * 0.2));
  
  // Use a deterministic approach to generate a subset of combinations
  for (let i = 0; i < numbers.length && result.length < targetCombinations; i++) {
    const combination: number[] = [];
    for (let j = 0; j < count; j++) {
      combination.push(numbers[(i + j) % numbers.length]);
    }
    result.push([...combination].sort((a, b) => a - b));
  }
  
  return result;
};

/**
 * Generate a key number wheeling system (combinations always including key numbers)
 */
const generateKeyNumberWheel = (
  numbers: number[],
  count: number,
  keyNumbers: number[]
): number[][] => {
  if (keyNumbers.length > count) {
    return [keyNumbers.slice(0, count)];
  }
  
  const nonKeyNumbers = numbers.filter(n => !keyNumbers.includes(n));
  const result: number[][] = [];
  
  // Generate combinations that always include all key numbers
  const remainingCount = count - keyNumbers.length;
  
  const generateCombinations = (
    current: number[],
    start: number,
    remaining: number
  ) => {
    if (remaining === 0) {
      result.push([...keyNumbers, ...current].sort((a, b) => a - b));
      return;
    }
    
    for (let i = start; i <= nonKeyNumbers.length - remaining; i++) {
      current.push(nonKeyNumbers[i]);
      generateCombinations(current, i + 1, remaining - 1);
      current.pop();
    }
  };
  
  generateCombinations([], 0, remainingCount);
  return result;
}; 