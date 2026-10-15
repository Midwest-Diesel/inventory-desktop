const taxableStates = [
  'FLORIDA', 'FL',
  'GEORGIA', 'GA',
  'ILLINOIS', 'IL',
  'INDIANA', 'IN',
  'IOWA', 'IA',
  'KANSAS', 'KS',
  'KENTUCKY', 'KY',
  'MISSOURI', 'MO',
  'NEBRASKA', 'NE',
  'NORTH DAKOTA', 'ND',
  'OHIO', 'OH',
  'PENNSYLVANIA', 'PA',
  'SOUTH DAKOTA', 'SD',
  'TEXAS', 'TX',
  'WISCONSIN', 'WI'
];

export const isStateTaxable = (state: string | null): boolean => {
  if (!state) return false;
  return taxableStates.includes(state.toUpperCase());
};
