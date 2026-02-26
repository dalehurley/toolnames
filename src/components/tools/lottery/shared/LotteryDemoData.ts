import { LotteryDraw } from './LotteryTypes';
import { fetchLotteryData, hasRealHistoricalData } from './LotteryDataFetcher';

/**
 * Static demonstration lottery data for popular lottery games
 * 
 * DISCLAIMER: This data is for demonstration purposes only and does not represent actual lottery draws.
 * While the format is accurate, the numbers are simulated.
 */

// Create 100 historical draws for Powerball (realistic-looking data)
export const POWERBALL_DEMO_DATA: LotteryDraw[] = [
  {
    id: 'pb-2023-12-30',
    date: new Date('2023-12-30'),
    mainNumbers: [12, 25, 37, 48, 62],
    bonusNumbers: [5],
    jackpot: 15800000,
    currency: 'USD',
    drawNumber: 1,
  },
  {
    id: 'pb-2023-12-27',
    date: new Date('2023-12-27'),
    mainNumbers: [4, 11, 38, 51, 68],
    bonusNumbers: [5],
    jackpot: 14700000,
    currency: 'USD',
    drawNumber: 2,
  },
  {
    id: 'pb-2023-12-23',
    date: new Date('2023-12-23'),
    mainNumbers: [9, 14, 33, 46, 64],
    bonusNumbers: [15],
    jackpot: 12500000,
    currency: 'USD',
    drawNumber: 3,
  },
  {
    id: 'pb-2023-12-20',
    date: new Date('2023-12-20'),
    mainNumbers: [2, 21, 35, 49, 66],
    bonusNumbers: [20],
    jackpot: 295000000,
    currency: 'USD',
    drawNumber: 4,
  },
  {
    id: 'pb-2023-12-16',
    date: new Date('2023-12-16'),
    mainNumbers: [5, 13, 29, 46, 58],
    bonusNumbers: [23],
    jackpot: 275000000,
    currency: 'USD',
    drawNumber: 5,
  },
  // Generate more realistic data
  ...Array.from({ length: 95 }, (_, i) => {
    // Create date going backwards from December 2023
    const date = new Date('2023-12-16');
    date.setDate(date.getDate() - (i + 5) * 3.5);
    
    // Random jackpot amount between $20M and $500M
    const jackpot = Math.floor(Math.random() * 48000) * 10000 + 20000000;
    
    // Generate 5 main numbers (1-69)
    const mainNumbers: number[] = [];
    while (mainNumbers.length < 5) {
      const num = Math.floor(Math.random() * 69) + 1;
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
    
    // Generate 1 bonus number (1-26)
    const bonusNumber = Math.floor(Math.random() * 26) + 1;
    
    return {
      id: `pb-${date.toISOString().substring(0, 10)}`,
      date: new Date(date),
      mainNumbers,
      bonusNumbers: [bonusNumber],
      jackpot,
      currency: 'USD',
      drawNumber: i + 6,
    };
  }),
];

// Create 100 historical draws for Mega Millions
export const MEGA_MILLIONS_DEMO_DATA: LotteryDraw[] = [
  {
    id: 'mm-2023-12-29',
    date: new Date('2023-12-29'),
    mainNumbers: [8, 17, 26, 45, 65],
    bonusNumbers: [8],
    jackpot: 22000000,
    currency: 'USD',
    drawNumber: 1,
  },
  {
    id: 'mm-2023-12-26',
    date: new Date('2023-12-26'),
    mainNumbers: [3, 19, 27, 37, 58],
    bonusNumbers: [12],
    jackpot: 20000000,
    currency: 'USD',
    drawNumber: 2,
  },
  {
    id: 'mm-2023-12-22',
    date: new Date('2023-12-22'),
    mainNumbers: [6, 15, 45, 57, 63],
    bonusNumbers: [18],
    jackpot: 510000000,
    currency: 'USD',
    drawNumber: 3,
  },
  {
    id: 'mm-2023-12-19',
    date: new Date('2023-12-19'),
    mainNumbers: [1, 24, 33, 44, 55],
    bonusNumbers: [19],
    jackpot: 483000000,
    currency: 'USD',
    drawNumber: 4,
  },
  {
    id: 'mm-2023-12-15',
    date: new Date('2023-12-15'),
    mainNumbers: [11, 29, 44, 52, 60],
    bonusNumbers: [25],
    jackpot: 465000000,
    currency: 'USD',
    drawNumber: 5,
  },
  // Generate more realistic data
  ...Array.from({ length: 95 }, (_, i) => {
    // Create date going backwards from December 2023
    const date = new Date('2023-12-15');
    date.setDate(date.getDate() - (i + 5) * 3.5);
    
    // Random jackpot amount between $20M and $600M
    const jackpot = Math.floor(Math.random() * 58000) * 10000 + 20000000;
    
    // Generate 5 main numbers (1-70)
    const mainNumbers: number[] = [];
    while (mainNumbers.length < 5) {
      const num = Math.floor(Math.random() * 70) + 1;
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
    
    // Generate 1 bonus number (1-25)
    const bonusNumber = Math.floor(Math.random() * 25) + 1;
    
    return {
      id: `mm-${date.toISOString().substring(0, 10)}`,
      date: new Date(date),
      mainNumbers,
      bonusNumbers: [bonusNumber],
      jackpot,
      currency: 'USD',
      drawNumber: i + 6,
    };
  }),
];

// Create 100 historical draws for EuroMillions
export const EUROMILLIONS_DEMO_DATA: LotteryDraw[] = [
  {
    id: 'em-2023-12-29',
    date: new Date('2023-12-29'),
    mainNumbers: [7, 13, 25, 42, 48],
    bonusNumbers: [2, 7],
    jackpot: 130000000,
    currency: 'EUR',
    drawNumber: 1,
  },
  {
    id: 'em-2023-12-26',
    date: new Date('2023-12-26'),
    mainNumbers: [9, 22, 26, 35, 44],
    bonusNumbers: [5, 9],
    jackpot: 120000000,
    currency: 'EUR',
    drawNumber: 2,
  },
  {
    id: 'em-2023-12-22',
    date: new Date('2023-12-22'),
    mainNumbers: [16, 28, 32, 37, 45],
    bonusNumbers: [1, 11],
    jackpot: 215000000,
    currency: 'EUR',
    drawNumber: 3,
  },
  {
    id: 'em-2023-12-19',
    date: new Date('2023-12-19'),
    mainNumbers: [3, 17, 31, 39, 47],
    bonusNumbers: [3, 10],
    jackpot: 200000000,
    currency: 'EUR',
    drawNumber: 4,
  },
  {
    id: 'em-2023-12-15',
    date: new Date('2023-12-15'),
    mainNumbers: [5, 14, 27, 36, 41],
    bonusNumbers: [4, 8],
    jackpot: 190000000,
    currency: 'EUR',
    drawNumber: 5,
  },
  // Generate more realistic data
  ...Array.from({ length: 95 }, (_, i) => {
    // Create date going backwards from December 2023
    const date = new Date('2023-12-15');
    date.setDate(date.getDate() - (i + 5) * 3.5);
    
    // Random jackpot amount between €17M and €230M
    const jackpot = Math.floor(Math.random() * 21300) * 10000 + 17000000;
    
    // Generate 5 main numbers (1-50)
    const mainNumbers: number[] = [];
    while (mainNumbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
    
    // Generate 2 bonus numbers (1-12)
    const bonusNumbers: number[] = [];
    while (bonusNumbers.length < 2) {
      const num = Math.floor(Math.random() * 12) + 1;
      if (!bonusNumbers.includes(num)) {
        bonusNumbers.push(num);
      }
    }
    bonusNumbers.sort((a, b) => a - b);
    
    return {
      id: `em-${date.toISOString().substring(0, 10)}`,
      date: new Date(date),
      mainNumbers,
      bonusNumbers,
      jackpot,
      currency: 'EUR',
      drawNumber: i + 6,
    };
  }),
];

// Create a mapping of lottery types to their respective demo data
export const LOTTERY_DEMO_DATA: Record<string, LotteryDraw[]> = {
  powerball: POWERBALL_DEMO_DATA,
  megaMillions: MEGA_MILLIONS_DEMO_DATA,
  euromillions: EUROMILLIONS_DEMO_DATA,
  // Add placeholder empty arrays for other lottery types
  standard: [],
  ukLotto: [],
  eurojackpot: [],
  superenalotto: [],
  oz649: [],
  lotto649: [],
  custom: [],
};

/**
 * Return demo data for a specific lottery type
 * If real historical data is available, it will be fetched from the official source.
 * Otherwise, demo data will be used.
 * @param lotteryType The lottery type ID
 */
export const getLotteryDemoData = async (lotteryType: string): Promise<LotteryDraw[]> => {
  // Check if we have real data available for this lottery type
  if (hasRealHistoricalData(lotteryType)) {
    try {
      // Try to fetch real historical data
      const realData = await fetchLotteryData(lotteryType);
      
      // If we got real data, return it
      if (realData && realData.length > 0) {
        console.log(`Loaded ${realData.length} real historical draws for ${lotteryType}`);
        return realData;
      }
    } catch (error) {
      console.error(`Error fetching real data for ${lotteryType}:`, error);
      // Fall back to demo data on error
    }
  }
  
  // Fall back to demo data
  return Promise.resolve(LOTTERY_DEMO_DATA[lotteryType] || []);
};

/**
 * Synchronous version of getLotteryDemoData that only returns local demo data
 * This is useful when you need to immediately access data without waiting for a fetch
 * @param lotteryType The lottery type ID
 */
export const getLotteryDemoDataSync = (lotteryType: string): LotteryDraw[] => {
  return LOTTERY_DEMO_DATA[lotteryType] || [];
};

/**
 * Calculate number frequency data from historical draws
 * @param draws Array of lottery draws
 * @param min Minimum number in the range
 * @param max Maximum number in the range
 * @param isBonus Whether to analyze bonus numbers
 */
export const calculateFrequencyFromDraws = (
  draws: LotteryDraw[],
  min: number,
  max: number,
  isBonus: boolean = false
): { number: number; frequency: number; isHot: boolean; isCold: boolean; isOverdue: boolean }[] => {
  // Initialize frequency map
  const frequencyMap: Record<number, number> = {};
  for (let i = min; i <= max; i++) {
    frequencyMap[i] = 0;
  }
  
  // Count occurrences in draws
  draws.forEach(draw => {
    const numbers = isBonus ? draw.bonusNumbers : draw.mainNumbers;
    numbers.forEach(num => {
      if (num >= min && num <= max) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      }
    });
  });
  
  // Calculate average and standard deviation
  const frequencies = Object.values(frequencyMap);
  const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
  const stdDev = Math.sqrt(
    frequencies.reduce((sum, freq) => sum + Math.pow(freq - avgFrequency, 2), 0) / frequencies.length
  );
  
  // Create result array with hot/cold/overdue status
  return Object.entries(frequencyMap).map(([numStr, frequency]) => {
    const number = parseInt(numStr, 10);
    return {
      number,
      frequency,
      isHot: frequency > avgFrequency + 0.5 * stdDev,
      isCold: frequency < avgFrequency - 0.5 * stdDev,
      isOverdue: Math.random() < 0.15, // Randomly assign overdue for demo purposes
    };
  }).sort((a, b) => a.number - b.number);
}; 