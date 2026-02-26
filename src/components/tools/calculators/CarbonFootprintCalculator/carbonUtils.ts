// Emission factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  // Transportation (kg CO2 per km)
  car: 0.21,
  flight: 0.255,
  publicTransit: 0.05,
  
  // Energy (kg CO2 per kWh)
  electricity: 0.5,
  naturalGas: 0.2,
  heatingOil: 0.27,
  
  // Food (kg CO2 per kg)
  meat: 27,
  dairy: 3.2,
  vegetables: 2,
  
  // Shopping (kg CO2 per $ spent)
  clothing: 0.5,
  electronics: 0.3,
  other: 0.2,
};

// National and global averages (tonnes CO2 per year)
export const AVERAGES = {
  national: 16, // USA average
  global: 4,
};

export interface CarbonInputs {
  // Transportation (per year)
  carKmPerYear: number;
  flightKmPerYear: number;
  transitKmPerYear: number;
  
  // Energy (per month)
  electricityKwhPerMonth: number;
  gasKwhPerMonth: number;
  heatingOilKwhPerMonth: number;
  
  // Food (per week)
  meatKgPerWeek: number;
  dairyKgPerWeek: number;
  vegetablesKgPerWeek: number;
  
  // Shopping (per month)
  clothingPerMonth: number;
  electronicsPerMonth: number;
  otherShoppingPerMonth: number;
}

export interface CategoryEmissions {
  transportation: number;
  energy: number;
  food: number;
  shopping: number;
}

export interface CarbonResults {
  totalEmissions: number; // tonnes CO2 per year
  categoryBreakdown: CategoryEmissions;
  percentages: CategoryEmissions;
  comparison: {
    nationalAverage: number;
    globalAverage: number;
    vsNational: number; // percentage difference
    vsGlobal: number; // percentage difference
  };
}

export function calculateTransportationEmissions(
  carKm: number,
  flightKm: number,
  transitKm: number
): number {
  return (
    carKm * EMISSION_FACTORS.car +
    flightKm * EMISSION_FACTORS.flight +
    transitKm * EMISSION_FACTORS.publicTransit
  );
}

export function calculateEnergyEmissions(
  electricityKwh: number,
  gasKwh: number,
  oilKwh: number
): number {
  return (
    electricityKwh * EMISSION_FACTORS.electricity +
    gasKwh * EMISSION_FACTORS.naturalGas +
    oilKwh * EMISSION_FACTORS.heatingOil
  );
}

export function calculateFoodEmissions(
  meatKg: number,
  dairyKg: number,
  vegetablesKg: number
): number {
  return (
    meatKg * EMISSION_FACTORS.meat +
    dairyKg * EMISSION_FACTORS.dairy +
    vegetablesKg * EMISSION_FACTORS.vegetables
  );
}

export function calculateShoppingEmissions(
  clothing: number,
  electronics: number,
  other: number
): number {
  return (
    clothing * EMISSION_FACTORS.clothing +
    electronics * EMISSION_FACTORS.electronics +
    other * EMISSION_FACTORS.other
  );
}

export function calculateCarbonFootprint(inputs: CarbonInputs): CarbonResults {
  // Calculate emissions by category
  const transportation = calculateTransportationEmissions(
    inputs.carKmPerYear,
    inputs.flightKmPerYear,
    inputs.transitKmPerYear
  );
  
  const energy = calculateEnergyEmissions(
    inputs.electricityKwhPerMonth * 12, // annual
    inputs.gasKwhPerMonth * 12,
    inputs.heatingOilKwhPerMonth * 12
  );
  
  const food = calculateFoodEmissions(
    inputs.meatKgPerWeek * 52, // annual
    inputs.dairyKgPerWeek * 52,
    inputs.vegetablesKgPerWeek * 52
  );
  
  const shopping = calculateShoppingEmissions(
    inputs.clothingPerMonth * 12, // annual
    inputs.electronicsPerMonth * 12,
    inputs.otherShoppingPerMonth * 12
  );
  
  const categoryBreakdown: CategoryEmissions = {
    transportation,
    energy,
    food,
    shopping,
  };
  
  // Total in kg, convert to tonnes
  const totalKg = transportation + energy + food + shopping;
  const totalTonnes = totalKg / 1000;
  
  // Calculate percentages
  const percentages: CategoryEmissions = {
    transportation: (transportation / totalKg) * 100,
    energy: (energy / totalKg) * 100,
    food: (food / totalKg) * 100,
    shopping: (shopping / totalKg) * 100,
  };
  
  // Calculate comparison
  const vsNational = ((totalTonnes - AVERAGES.national) / AVERAGES.national) * 100;
  const vsGlobal = ((totalTonnes - AVERAGES.global) / AVERAGES.global) * 100;
  
  return {
    totalEmissions: totalTonnes,
    categoryBreakdown,
    percentages,
    comparison: {
      nationalAverage: AVERAGES.national,
      globalAverage: AVERAGES.global,
      vsNational,
      vsGlobal,
    },
  };
}

export interface ReductionSuggestion {
  title: string;
  description: string;
  impact: number; // kg CO2 saved per year
  category: keyof CategoryEmissions;
}

export function getReductionSuggestions(
  inputs: CarbonInputs
): ReductionSuggestion[] {
  const suggestions: ReductionSuggestion[] = [];
  
  // Transportation suggestions
  if (inputs.carKmPerYear > 10000) {
    suggestions.push({
      title: 'Reduce car travel by 25%',
      description: 'Consider carpooling, combining trips, or using alternative transportation',
      impact: inputs.carKmPerYear * 0.25 * EMISSION_FACTORS.car,
      category: 'transportation',
    });
  }
  
  if (inputs.flightKmPerYear > 5000) {
    suggestions.push({
      title: 'Reduce air travel',
      description: 'Consider virtual meetings or train travel for shorter distances',
      impact: 5000 * EMISSION_FACTORS.flight,
      category: 'transportation',
    });
  }
  
  // Energy suggestions
  if (inputs.electricityKwhPerMonth > 500) {
    suggestions.push({
      title: 'Reduce electricity usage by 20%',
      description: 'Use energy-efficient appliances, LED bulbs, and unplug devices',
      impact: inputs.electricityKwhPerMonth * 0.2 * 12 * EMISSION_FACTORS.electricity,
      category: 'energy',
    });
  }
  
  // Food suggestions
  if (inputs.meatKgPerWeek > 2) {
    suggestions.push({
      title: 'Reduce meat consumption by 50%',
      description: 'Try Meatless Monday or replace beef with chicken or plant-based alternatives',
      impact: inputs.meatKgPerWeek * 0.5 * 52 * EMISSION_FACTORS.meat,
      category: 'food',
    });
  }
  
  // Shopping suggestions
  if (inputs.clothingPerMonth > 50) {
    suggestions.push({
      title: 'Buy less clothing',
      description: 'Choose quality over quantity and consider second-hand options',
      impact: 50 * 12 * EMISSION_FACTORS.clothing,
      category: 'shopping',
    });
  }
  
  // Sort by impact (highest first)
  return suggestions.sort((a, b) => b.impact - a.impact);
}
