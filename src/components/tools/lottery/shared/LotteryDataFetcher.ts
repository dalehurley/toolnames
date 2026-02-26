import { LotteryDraw } from './LotteryTypes';

/**
 * This utility handles fetching and parsing historical lottery data from external CSV sources
 */

/**
 * Fetches lottery data from CSV files
 * @param lotteryType The type of lottery to fetch data for
 * @returns Promise resolving to array of LotteryDraw objects
 */
export const fetchLotteryData = async (lotteryType: string): Promise<LotteryDraw[]> => {
  try {
    const response = await fetch(`/data/${lotteryType}.csv`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${lotteryType} data`);
    }
    const text = await response.text();
    const rows = text.split('\n').filter(row => row.trim());
    
    // Parse based on lottery type
    if (lotteryType === 'powerball') {
      return parsePowerballData(rows);
    } else if (lotteryType === 'megamillions') {
      return parseMegaMillionsData(rows);
    }
    
    throw new Error(`Unsupported lottery type: ${lotteryType}`);
  } catch (error) {
    console.error(`Error fetching ${lotteryType} data:`, error);
    return [];
  }
};

/**
 * Parses Powerball CSV data
 */
const parsePowerballData = (dataRows: string[]): LotteryDraw[] => {
  return dataRows.map((row) => {
    const [date, numbers] = row.split(",");
    const [mainNumbers, bonusNumber] = numbers.split("|");
    return {
      id: date,
      date: new Date(date),
      mainNumbers: mainNumbers.split(" ").map(Number),
      bonusNumbers: [Number(bonusNumber)],
    };
  });
};

/**
 * Parses Mega Millions CSV data
 */
const parseMegaMillionsData = (dataRows: string[]): LotteryDraw[] => {
  return dataRows.map((row) => {
    const [date, numbers] = row.split(",");
    const [mainNumbers, bonusNumber] = numbers.split("|");
    return {
      id: date,
      date: new Date(date),
      mainNumbers: mainNumbers.split(" ").map(Number),
      bonusNumbers: [Number(bonusNumber)],
    };
  });
};

/**
 * Function to determine if we can use real data for a lottery type
 */
export const hasRealHistoricalData = (lotteryType: string): boolean => {
  return lotteryType === 'powerball' || lotteryType === 'megamillions';
}; 