export type PayPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  preTax: boolean;
}

export interface SalaryInputs {
  amount: number;
  period: PayPeriod;
  hoursPerWeek: number;
  stateTaxRate: number;
  filingStatus: 'single' | 'married' | 'head';
  deductions: Deduction[];
}

export interface TakeHomePayResult {
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalDeductions: number;
  netPay: number;
  effectiveTaxRate: number;
}

export interface ConvertedSalary {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annual: number;
}
