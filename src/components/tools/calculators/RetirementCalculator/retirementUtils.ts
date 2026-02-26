/**
 * Retirement Calculator Utility Functions
 * All calculations for retirement planning
 */

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  desiredIncome: number;
  inflationRate: number;
  withdrawalStrategy: "four-percent" | "fixed" | "percentage";
  withdrawalAmount?: number;
  withdrawalPercentage?: number;
  includeSocialSecurity: boolean;
  socialSecurityAmount?: number;
  employerMatch: boolean;
  employerMatchPercentage?: number;
  employerMatchLimit?: number;
}

export interface RetirementResults {
  yearsToRetirement: number;
  totalSavings: number;
  annualWithdrawal: number;
  monthlyWithdrawal: number;
  isSufficient: boolean;
  shortfall?: number;
  timeline: Array<{ year: number; balance: number; withdrawal: number }>;
  savingsGrowth: Array<{
    year: number;
    age: number;
    balance: number;
    contributions: number;
    interest: number;
  }>;
  contributionBreakdown: {
    totalContributions: number;
    totalGrowth: number;
    employerContributions: number;
  };
  yearsOfRetirement: number;
}

export interface RetirementScenario {
  id: string;
  name: string;
  inputs: RetirementInputs;
  results: RetirementResults;
  createdAt: Date;
}

/**
 * Calculate future value of retirement savings
 */
export function calculateFutureValue(
  presentValue: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
  employerMatch: number = 0
): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  // Future value of present value
  const fvPresent = presentValue * Math.pow(1 + monthlyRate, months);

  // Total monthly contribution including employer match
  const totalMonthlyContribution = monthlyContribution * (1 + employerMatch);

  // Future value of annuity (monthly contributions)
  const fvAnnuity =
    totalMonthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return fvPresent + fvAnnuity;
}

/**
 * Calculate detailed savings growth year by year
 */
export function calculateSavingsGrowth(
  inputs: RetirementInputs
): Array<{
  year: number;
  age: number;
  balance: number;
  contributions: number;
  interest: number;
}> {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const growth: Array<{
    year: number;
    age: number;
    balance: number;
    contributions: number;
    interest: number;
  }> = [];

  let balance = inputs.currentSavings;
  let totalContributions = inputs.currentSavings;

  // Calculate employer match percentage
  const employerMatchRate = inputs.employerMatch
    ? (inputs.employerMatchPercentage || 0) / 100
    : 0;

  for (let year = 0; year <= yearsToRetirement; year++) {
    // Annual contributions (monthly * 12)
    const annualContribution = inputs.monthlyContribution * 12;
    const employerContribution = Math.min(
      annualContribution * employerMatchRate,
      inputs.employerMatchLimit || Infinity
    );
    const totalYearContribution = annualContribution + employerContribution;

    // Apply contributions throughout the year with monthly compounding
    for (let month = 1; month <= 12; month++) {
      const monthlyContribution =
        inputs.monthlyContribution * (1 + employerMatchRate);
      balance = balance * (1 + inputs.annualReturn / 12) + monthlyContribution;
    }

    totalContributions += totalYearContribution;

    growth.push({
      year,
      age: inputs.currentAge + year,
      balance,
      contributions: totalContributions,
      interest: balance - totalContributions,
    });
  }

  return growth;
}

/**
 * Calculate 4% rule withdrawal amount
 */
export function calculateFourPercentRule(portfolioValue: number): number {
  return portfolioValue * 0.04;
}

/**
 * Calculate withdrawal timeline during retirement
 */
export function calculateWithdrawalTimeline(
  initialBalance: number,
  annualWithdrawal: number,
  annualReturn: number,
  inflationRate: number,
  years: number,
  adjustForInflation: boolean = true
): Array<{ year: number; balance: number; withdrawal: number }> {
  let balance = initialBalance;
  const timeline: Array<{ year: number; balance: number; withdrawal: number }> =
    [];

  let currentWithdrawal = annualWithdrawal;

  for (let year = 1; year <= years; year++) {
    // Adjust withdrawal for inflation if enabled
    if (adjustForInflation && year > 1) {
      currentWithdrawal = currentWithdrawal * (1 + inflationRate);
    }

    // Apply returns for the year
    balance = balance * (1 + annualReturn);

    // Subtract withdrawal
    balance = Math.max(0, balance - currentWithdrawal);

    timeline.push({
      year,
      balance,
      withdrawal: currentWithdrawal,
    });

    // Stop if balance reaches zero
    if (balance === 0) break;
  }

  return timeline;
}

/**
 * Main retirement calculation function
 */
export function calculateRetirement(
  inputs: RetirementInputs
): RetirementResults {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;

  // Validate inputs
  if (yearsToRetirement <= 0) {
    throw new Error("Retirement age must be greater than current age");
  }

  // Calculate employer match rate
  const employerMatchRate = inputs.employerMatch
    ? (inputs.employerMatchPercentage || 0) / 100
    : 0;

  // Calculate future value
  const totalSavings = calculateFutureValue(
    inputs.currentSavings,
    inputs.monthlyContribution,
    inputs.annualReturn,
    yearsToRetirement,
    employerMatchRate
  );

  // Calculate savings growth timeline
  const savingsGrowth = calculateSavingsGrowth(inputs);

  // Calculate contribution breakdown
  const totalPersonalContributions =
    inputs.currentSavings + inputs.monthlyContribution * 12 * yearsToRetirement;
  const totalEmployerContributions = inputs.employerMatch
    ? Math.min(
        inputs.monthlyContribution *
          12 *
          yearsToRetirement *
          employerMatchRate,
        (inputs.employerMatchLimit || Infinity) * yearsToRetirement
      )
    : 0;
  const totalGrowth =
    totalSavings - totalPersonalContributions - totalEmployerContributions;

  // Calculate withdrawal amount based on strategy
  let annualWithdrawal: number;
  switch (inputs.withdrawalStrategy) {
    case "four-percent":
      annualWithdrawal = calculateFourPercentRule(totalSavings);
      break;
    case "fixed":
      annualWithdrawal = inputs.withdrawalAmount || 0;
      break;
    case "percentage":
      annualWithdrawal =
        totalSavings * ((inputs.withdrawalPercentage || 0) / 100);
      break;
    default:
      annualWithdrawal = 0;
  }

  // Add Social Security if included
  let totalAnnualIncome = annualWithdrawal;
  if (inputs.includeSocialSecurity && inputs.socialSecurityAmount) {
    totalAnnualIncome += inputs.socialSecurityAmount;
  }

  // Calculate withdrawal timeline (30 years default)
  const retirementYears = 30;
  const realReturn = inputs.annualReturn - inputs.inflationRate;
  const timeline = calculateWithdrawalTimeline(
    totalSavings,
    annualWithdrawal,
    realReturn,
    inputs.inflationRate,
    retirementYears,
    true
  );

  // Determine how long the money lasts
  const yearsOfRetirement =
    timeline.findIndex((t) => t.balance === 0) || retirementYears;

  // Check if savings are sufficient
  const isSufficient = totalAnnualIncome >= inputs.desiredIncome;
  const shortfall = isSufficient
    ? 0
    : inputs.desiredIncome - totalAnnualIncome;

  return {
    yearsToRetirement,
    totalSavings,
    annualWithdrawal,
    monthlyWithdrawal: annualWithdrawal / 12,
    isSufficient,
    shortfall,
    timeline,
    savingsGrowth,
    contributionBreakdown: {
      totalContributions: totalPersonalContributions,
      totalGrowth,
      employerContributions: totalEmployerContributions,
    },
    yearsOfRetirement:
      yearsOfRetirement < retirementYears ? yearsOfRetirement : retirementYears,
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Validate retirement inputs
 */
export function validateInputs(inputs: Partial<RetirementInputs>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (
    inputs.currentAge !== undefined &&
    (inputs.currentAge < 18 || inputs.currentAge > 100)
  ) {
    errors.currentAge = "Current age must be between 18 and 100";
  }

  if (
    inputs.retirementAge !== undefined &&
    inputs.currentAge !== undefined &&
    inputs.retirementAge <= inputs.currentAge
  ) {
    errors.retirementAge = "Retirement age must be greater than current age";
  }

  if (
    inputs.retirementAge !== undefined &&
    (inputs.retirementAge < 18 || inputs.retirementAge > 100)
  ) {
    errors.retirementAge = "Retirement age must be between 18 and 100";
  }

  if (inputs.currentSavings !== undefined && inputs.currentSavings < 0) {
    errors.currentSavings = "Current savings cannot be negative";
  }

  if (
    inputs.monthlyContribution !== undefined &&
    inputs.monthlyContribution < 0
  ) {
    errors.monthlyContribution = "Monthly contribution cannot be negative";
  }

  if (
    inputs.annualReturn !== undefined &&
    (inputs.annualReturn < 0 || inputs.annualReturn > 0.2)
  ) {
    errors.annualReturn = "Annual return must be between 0% and 20%";
  }

  if (inputs.inflationRate !== undefined && inputs.inflationRate < 0) {
    errors.inflationRate = "Inflation rate cannot be negative";
  }

  if (inputs.desiredIncome !== undefined && inputs.desiredIncome < 0) {
    errors.desiredIncome = "Desired income cannot be negative";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
