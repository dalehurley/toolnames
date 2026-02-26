import { LotteryConfig } from './LotteryTypes';

/**
 * Predefined lottery configurations
 */
export const LOTTERY_CONFIGS: Record<string, LotteryConfig> = {
  powerball: {
    name: "Powerball (US)",
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
    name: "Mega Millions (US)",
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
  euromillions: {
    name: "EuroMillions",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50
    },
    bonusNumbers: {
      count: 2,
      min: 1,
      max: 12
    }
  },
  ukLotto: {
    name: "UK National Lottery",
    mainNumbers: {
      count: 6,
      min: 1,
      max: 59
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 59
    }
  },
  eurojackpot: {
    name: "Eurojackpot",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50
    },
    bonusNumbers: {
      count: 2,
      min: 1,
      max: 10
    }
  },
  superenalotto: {
    name: "SuperEnalotto (Italy)",
    mainNumbers: {
      count: 6,
      min: 1,
      max: 90
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 90
    }
  },
  oz649: {
    name: "Oz Lotto (Australia)",
    mainNumbers: {
      count: 7,
      min: 1,
      max: 45
    }
  },
  lotto649: {
    name: "Lotto 6/49 (Canada)",
    mainNumbers: {
      count: 6,
      min: 1,
      max: 49
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 49
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

/**
 * Get a list of all lottery configurations
 */
export const getLotteryConfigList = (): Array<{ id: string; name: string }> => {
  return Object.entries(LOTTERY_CONFIGS)
    .filter(([key]) => key !== 'custom')
    .map(([key, config]) => ({
      id: key,
      name: config.name
    }));
};

/**
 * Get the total possible combinations for a lottery configuration
 */
export const getTotalCombinations = (config: LotteryConfig): number => {
  const mainCombinations = calculateCombinations(
    config.mainNumbers.max - config.mainNumbers.min + 1,
    config.mainNumbers.count
  );
  
  let bonusCombinations = 1;
  if (config.bonusNumbers) {
    bonusCombinations = calculateCombinations(
      config.bonusNumbers.max - config.bonusNumbers.min + 1,
      config.bonusNumbers.count
    );
  }
  
  return mainCombinations * bonusCombinations;
};

/**
 * Calculate combinations: n! / (r! * (n-r)!)
 */
export const calculateCombinations = (n: number, r: number): number => {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;

  // Use logarithms for large numbers to avoid overflows
  if (n > 100) {
    let result = 0;
    for (let i = n - r + 1; i <= n; i++) {
      result += Math.log(i);
    }
    for (let i = 1; i <= r; i++) {
      result -= Math.log(i);
    }
    return Math.round(Math.exp(result));
  }

  // Direct calculation for smaller numbers
  let result = 1;
  for (let i = 1; i <= r; i++) {
    result *= (n - (i - 1)) / i;
  }
  return Math.round(result);
}; 