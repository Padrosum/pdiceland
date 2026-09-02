import type { MarketItemDefinition } from '../config/marketConfig';
import { getItemPrice } from '../config/marketConfig';
import type { PlayerState } from '../core/types';

export interface PurchaseResult {
  success: boolean;
  player: PlayerState;
  message: string;
}

export function canPurchaseItem(
  item: MarketItemDefinition,
  player: PlayerState,
): { allowed: boolean; reason: string } {
  const price = getItemPrice(item, player.stageNumber);

  if (player.score < price) {
    return { allowed: false, reason: `Not enough gold (need ${price})` };
  }

  switch (item.effect) {
    case 'heal1':
      if (player.health >= player.maxHealth) {
        return { allowed: false, reason: 'HP already full' };
      }
      break;
    case 'fullHeal':
      if (player.health >= player.maxHealth) {
        return { allowed: false, reason: 'HP already full' };
      }
      break;
    case 'maxHealth':
      if (player.maxHealth >= 6) {
        return { allowed: false, reason: 'Max HP limit reached' };
      }
      break;
  }

  return { allowed: true, reason: '' };
}

export function purchaseItem(
  item: MarketItemDefinition,
  player: PlayerState,
): PurchaseResult {
  const check = canPurchaseItem(item, player);
  if (!check.allowed) {
    return { success: false, player, message: check.reason };
  }

  const price = getItemPrice(item, player.stageNumber);
  let next: PlayerState = { ...player, score: player.score - price };

  switch (item.effect) {
    case 'heal1':
      next = { ...next, health: Math.min(next.maxHealth, next.health + 1) };
      break;
    case 'fullHeal':
      next = { ...next, health: next.maxHealth };
      break;
    case 'maxHealth':
      next = {
        ...next,
        maxHealth: next.maxHealth + 1,
        health: next.health + 1,
      };
      break;
  }

  return {
    success: true,
    player: next,
    message: `Bought ${item.name}! (-${price} gold)`,
  };
}
