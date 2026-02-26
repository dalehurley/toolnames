export interface CashFlow {
  id: string;
  date: Date;
  amount: number;
  type: 'contribution' | 'withdrawal';
}

export interface RatePeriod {
  id: string;
  year: number;
  rate: number;
  // rate is percentage, e.g., 5.0 for 5%
}

export interface ROIInputs {
  initialInvestment: number;
  finalValue?: number;
  roiPercentage?: number;
  investmentPeriod: number;
  periodUnit: 'years' | 'months';
  
  // Advanced
  cashFlows: CashFlow[];
  variableRates: RatePeriod[];
  taxRate: number; // percentage
  inflationRate: number; // percentage
  
  // Scenarios
  name?: string;
}

export interface ROIResult {
  simpleROI: number;
  annualizedROI: number;
  absoluteReturn: number;
  finalValue: number;
  
  // Advanced Results
  totalContributions: number;
  netInvested: number;
  inflationAdjustedReturn?: number;
  afterTaxReturn?: number;
  
  // For Charts
  timeline: { 
      label: string; // Year or Date
      value: number; 
      invested: number; 
  }[];
  
  breakdown: { label: string; value: number; fill?: string }[];
}

export interface ComparisonScenario {
    id: string;
    name: string;
    inputs: ROIInputs;
    result: ROIResult;
}
