export type MarketEffect = 'heal1' | 'fullHeal' | 'maxHealth';

export interface MarketItemDefinition {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  effect: MarketEffect;
}

export const MARKET_ITEMS: MarketItemDefinition[] = [
  {
    id: 'blood-potion',
    name: 'Blood Potion',
    description: 'Restore 1 HP.',
    basePrice: 80,
    effect: 'heal1',
  },
  {
    id: 'dark-elixir',
    name: 'Dark Elixir',
    description: 'Fully restore HP.',
    basePrice: 150,
    effect: 'fullHeal',
  },
  {
    id: 'heart-stone',
    name: 'Heart Stone',
    description: 'Max HP +1 and heal 1 HP.',
    basePrice: 250,
    effect: 'maxHealth',
  },
];

export function getItemPrice(item: MarketItemDefinition, stageNumber: number): number {
  return Math.round(item.basePrice * (1 + (stageNumber - 1) * 0.15));
}
