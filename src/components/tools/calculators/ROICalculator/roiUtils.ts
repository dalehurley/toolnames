import { differenceInDays, addYears } from "date-fns";
import { CashFlow, ROIInputs, ROIResult } from "./types";

export function calculateSimpleROI(
  initialInvestment: number,
  finalValue: number
): { roiPercentage: number; absoluteReturn: number } {
  const absoluteReturn = finalValue - initialInvestment;
  const roiPercentage = initialInvestment !== 0 ? (absoluteReturn / initialInvestment) * 100 : 0;
  return { roiPercentage, absoluteReturn };
}

export function calculateAnnualizedROI(
  initialInvestment: number,
  finalValue: number,
  years: number
): number {
    if (initialInvestment === 0 || years <= 0) return 0;
    if (finalValue <= 0) return -100; // Total loss or negative
    
    const roi = finalValue / initialInvestment;
    return (Math.pow(roi, 1 / years) - 1) * 100;
}

export function calculateModifiedDietzROI(
  initialValue: number,
  finalValue: number,
  cashFlows: CashFlow[],
  startDate: Date,
  endDate: Date
): number {
  const totalDays = differenceInDays(endDate, startDate);
  if (totalDays === 0) return 0;

  let weightedCashFlows = 0;
  let netCashFlow = 0;
  
  cashFlows.forEach(flow => {
    const daysRemaining = differenceInDays(endDate, flow.date);
    // Weight must be between 0 and 1
    const weight = Math.max(0, Math.min(1, daysRemaining / totalDays));
    
    const flowAmount = flow.type === 'contribution' ? flow.amount : -flow.amount;
    netCashFlow += flowAmount;
    weightedCashFlows += flowAmount * weight;
  });
  
  const gain = finalValue - initialValue - netCashFlow;
  const averageCapital = initialValue + weightedCashFlows;
  
  if (averageCapital === 0) return 0;
  
  return (gain / averageCapital) * 100;
}

export function calculateROI(inputs: ROIInputs): ROIResult {
    const { 
        initialInvestment, 
        finalValue: userFinalValue, 
        roiPercentage,
        investmentPeriod, 
        periodUnit,
        cashFlows = []
    } = inputs;
    
    let years = investmentPeriod;
    if (periodUnit === 'months') {
        years = investmentPeriod / 12;
    }
    
    // 1. Determine Final Value
    let finalValue = userFinalValue ?? 0;
    
    if (userFinalValue === undefined && roiPercentage !== undefined) {
         finalValue = initialInvestment * (1 + roiPercentage / 100);
    }
    
    // 2. Aggregate Flows
    const netContributions = cashFlows.reduce((sum, f) => {
        return sum + (f.type === 'contribution' ? f.amount : -f.amount);
    }, 0);
    
    const totalInvested = initialInvestment + netContributions;
    
    // 3. Simple ROI
    // (Final - Invested) / Invested
    // If we have cash flows, simple ROI is typically on the Total Invested Capital
    const absoluteReturn = finalValue - totalInvested;
    const simpleROI = totalInvested !== 0 ? (absoluteReturn / totalInvested) * 100 : 0;
    
    // 4. Annualized ROI
    let annualizedROI = 0;
    if (cashFlows.length > 0) {
        // Use Dietz if cash flows exist
        // Assume start is today, end is today + years
        // And assume cash flows are within this range (or just use simple annualized if no dates provided)
        // For simplicity in this general function, we'll try the simple CAGR on the total, 
        // but Dietz is better.
        const now = new Date();
        const future = addYears(now, years);
        // We'd need actual dates on cashFlows relative to 'now' to use Dietz effectively here.
        // If cashFlows have dates, we use them. If they are just "annual contributions", it's different.
        // The input interface has Date.
        annualizedROI = calculateModifiedDietzROI(initialInvestment, finalValue, cashFlows, now, future);
    } else {
        annualizedROI = calculateAnnualizedROI(initialInvestment, finalValue, years);
    }

    // 5. Timeline Generation
    const timeline = [];
    // Assuming constant Growth Rate derived from Annualized ROI
    const rate = annualizedROI / 100;
    
    // We'll generate points. If years is small (< 5), show months? No, simplicity first.
    const steps = Math.ceil(years);
    const stepSize = years / steps; // usually 1 year
    
    for (let i = 0; i <= steps; i++) {
        const t = i * stepSize;
        // Compound growth: P * (1+r)^t
        // This is a projection based on the calculated result
        const projectedValue = initialInvestment * Math.pow(1 + rate, t);
        // Add cash flows? This is visualizing the result, so yes, if we knew when they happened.
        // For simple visualization, we just plot the growth curve that matches the end state.
        
        // Better approach for timeline: 
        // If we know the End Value, we plot a line from Start to End? 
        // Or exponential curve.
        
        timeline.push({
            label: `Year ${i}`,
            value: projectedValue,
            invested: initialInvestment // Simplify invested line to flat for basic
        });
    }
    
    // Fix last point to match exactly
    if (timeline.length > 0) {
        timeline[timeline.length - 1].value = finalValue;
        timeline[timeline.length - 1].invested = totalInvested;
    }

    return {
        simpleROI,
        annualizedROI,
        absoluteReturn,
        finalValue,
        totalContributions: cashFlows.filter(f => f.type === 'contribution').reduce((s,f) => s+f.amount, 0),
        netInvested: totalInvested,
        timeline,
        breakdown: [
            { label: 'Invested Capital', value: totalInvested, fill: 'hsl(var(--primary))' },
            { label: 'Profit/Loss', value: Math.abs(absoluteReturn), fill: absoluteReturn >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }
        ]
    };
}
