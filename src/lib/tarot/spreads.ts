export type SpreadType = 'one' | 'three' | 'celtic';

export interface SpreadDef {
  count: number;
  positions: readonly string[];
  cost: number;
}

export const SPREADS: Record<SpreadType, SpreadDef> = {
  one: {
    count: 1,
    positions: ['today'],
    cost: 1,
  },
  three: {
    count: 3,
    positions: ['past', 'present', 'future'],
    cost: 3,
  },
  celtic: {
    count: 10,
    positions: [
      'situation',
      'challenge',
      'past',
      'future',
      'above',
      'below',
      'advice',
      'external',
      'hopes_fears',
      'outcome',
    ],
    cost: 7,
  },
} as const;

export function isSpreadType(value: unknown): value is SpreadType {
  return value === 'one' || value === 'three' || value === 'celtic';
}

export function getSpread(type: SpreadType): SpreadDef {
  return SPREADS[type];
}
