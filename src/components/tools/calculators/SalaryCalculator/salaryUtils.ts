import { PayPeriod, Deduction, TakeHomePayResult, ConvertedSalary } from "./types";

export const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

export function convertSalary(
  amount: number,
  fromPeriod: PayPeriod,
  hoursPerWeek: number = 40,
  daysPerWeek: number = 5,
  weeksPerYear: number = 52
): ConvertedSalary {
  let annual = 0;

  // Convert to annual first
  switch (fromPeriod) {
    case 'hourly':
      annual = amount * hoursPerWeek * weeksPerYear;
      break;
    case 'daily':
      annual = amount * daysPerWeek * weeksPerYear;
      break;
    case 'weekly':
      annual = amount * weeksPerYear;
      break;
    case 'monthly':
      annual = amount * 12;
      break;
    case 'annual':
      annual = amount;
      break;
  }

  return {
    hourly: annual / (hoursPerWeek * weeksPerYear),
    daily: annual / (weeksPerYear * daysPerWeek),
    weekly: annual / weeksPerYear,
    biweekly: annual / 26,
    monthly: annual / 12,
    annual: annual,
  };
}

// 2024 Federal Tax Brackets (Simplified for Single Filer)
// For a real app, we'd need multiple filing statuses
const TAX_BRACKETS_2024 = {
    single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 },
    ],
    married: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 },
    ],
    head: [ // Head of Household
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 },
    ]
};

const STANDARD_DEDUCTION_2024 = {
    single: 14600,
    married: 29200,
    head: 21900
};

export function calculateFederalTax(taxableIncome: number, filingStatus: 'single' | 'married' | 'head' = 'single'): number {
  const brackets = TAX_BRACKETS_2024[filingStatus];
  let tax = 0;
  
  // Tax is calculated on income exceeding previous bracket max
  // Standard progressive calculation
  
  for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
          const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
          tax += taxableInThisBracket * bracket.rate;
      }
  }
  
  return tax;
}

export function calculateTakeHomePay(
  grossSalary: number,
  stateTaxRate: number, // percentage 0-100
  filingStatus: 'single' | 'married' | 'head',
  deductions: Deduction[]
): TakeHomePayResult {
    
  // 1. Calculate Pre-Tax Deductions
  let preTaxDeductionTotal = 0;
  deductions.filter(d => d.preTax).forEach(d => {
      if (d.type === 'fixed') preTaxDeductionTotal += d.amount;
      else preTaxDeductionTotal += (grossSalary * (d.amount / 100)); // Percentage
  });

  // Adjustable Gross Income for Federal Tax
  // (Simplified, usually FICA is on gross, income tax on taxable)
  // Social Security / Medicare are typically based on Gross Pay (with some pre-tax exceptions like insurance, but not 401k for FICA usually)
  // For simplicity, we'll assume pre-tax deductions reduce taxable income for Federal/State tax, 
  // but we should verify FICA rules. 
  // FICA (SS + Medicare) usually applies to Gross Income before 401k, but after health insurance. 
  // To keep it simple but useful: We will apply FICA to Gross.
  // We will apply Federal/State Tax to (Gross - PreTaxDeductions - StandardDeduction).

  const standardDeduction = STANDARD_DEDUCTION_2024[filingStatus];
  const taxableIncome = Math.max(0, grossSalary - preTaxDeductionTotal - standardDeduction);

  const federalTax = calculateFederalTax(taxableIncome, filingStatus);
  const stateTax = taxableIncome * (stateTaxRate / 100);
  
  const socialSecurityRate = 0.062;
  const socialSecurityWageBase = 168600; // 2024 limit
  const socialSecurity = Math.min(grossSalary, socialSecurityWageBase) * socialSecurityRate;
  
  const medicareRate = 0.0145;
  const medicare = grossSalary * medicareRate;

  // Post-Tax Deductions
  let postTaxDeductionTotal = 0;
   deductions.filter(d => !d.preTax).forEach(d => {
      if (d.type === 'fixed') postTaxDeductionTotal += d.amount;
      else postTaxDeductionTotal += (grossSalary * (d.amount / 100));
  });

  const totalDeductions = preTaxDeductionTotal + postTaxDeductionTotal;
  const totalTaxes = federalTax + stateTax + socialSecurity + medicare;
  const netPay = grossSalary - totalTaxes - totalDeductions;

  return {
    grossPay: grossSalary,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalDeductions,
    netPay,
    effectiveTaxRate: grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0
  };
}
