/**
 * Shared types for lottery tools
 */

/**
 * Lottery configuration interface
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

/**
 * Saved lottery numbers set
 */
export interface SavedNumberSet {
  main: number[];
  bonus: number[];
  config: string;
  date: Date;
  name?: string;
}

/**
 * Lottery odds calculation result
 */
export interface OddsResult {
  mainNumbersOdds: number;
  bonusNumbersOdds: number;
  totalOdds: number;
  additionalPrizes: OddsCalculation[];
}

/**
 * Individual odds calculation for a prize tier
 */
export interface OddsCalculation {
  description: string;
  odds: number;
  matches: string;
  prize?: string;
}

/**
 * Historical lottery draw
 */
export interface LotteryDraw {
  id: string;
  date: Date;
  mainNumbers: number[];
  bonusNumbers: number[];
  jackpot?: number;
  currency?: string;
  drawNumber?: number;
}

/**
 * Lottery number frequency data
 */
export interface NumberFrequency {
  number: number;
  frequency: number;
  lastDrawn?: Date;
  isHot?: boolean;
  isCold?: boolean;
  isOverdue?: boolean;
}

/**
 * Wheeling system
 */
export interface WheelingSystem {
  id: string;
  name: string;
  description: string;
  numbers: number[];
  type: 'full' | 'abbreviated' | 'key';
  guarantee: string;
  combinations: number[][];
  keyNumbers?: number[];
}

/**
 * Lottery strategy
 */
export interface LotteryStrategy {
  id: string;
  name: string;
  description: string;
  type: 'hot-cold' | 'balanced' | 'random' | 'pattern' | 'custom';
  config: Record<string, unknown>;
} 