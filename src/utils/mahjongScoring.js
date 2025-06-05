// For the calculateScore function

// src/utils/mahjongScoring.js
import { tiles, tileLabels } from '../data/MahjongTiles';

export const calculateScore = (hand, flowers, kongs) => {
  let score = 0;
  let tai = [];

  // Basic winning hand (Placeholder - needs proper hand validation)
  if (hand.length === 14 || (hand.length + kongs.length * 4 === 14)) {
    score += 1;
    tai.push('Basic Hand (1 tai)');
  }

  // Flower tiles
  if (flowers.length > 0) {
    score += flowers.length;
    tai.push(`Flowers: ${flowers.length} tai`);
  }

  // Kong bonuses
  kongs.forEach(kong => {
    if (tiles.honors.includes(kong)) {
      score += 2;
      tai.push(`Honor Kong (2 tai): ${tileLabels[kong]}`);
    } else {
      score += 1;
      tai.push(`Regular Kong (1 tai): ${tileLabels[kong]}`);
    }
  });

  // Special combinations (Simplified - needs full Mahjong rule implementation)
  const allTiles = [...hand, ...kongs].flat(); // Flatten in case kongs are arrays of 4 tiles
  const uniqueAllTiles = [...new Set(allTiles)]; // Get unique tiles for counting

  // All Honors
  const honorTilesInHand = uniqueAllTiles.filter(tile => tiles.honors.includes(tile));
  if (honorTilesInHand.length > 0 && honorTilesInHand.length === uniqueAllTiles.length) {
    score += 10;
    tai.push('All Honors (10 tai)');
  }

  // Pure One Suit
  const suits = ['m', 's', 'p'];
  for (let suit of suits) {
    const suitTilesInHand = uniqueAllTiles.filter(tile => tile.includes(suit));
    if (suitTilesInHand.length > 0 && suitTilesInHand.length === uniqueAllTiles.length) {
      score += 7;
      tai.push(`Pure One Suit (${suit === 'm' ? 'Dots' : suit === 's' ? 'Bamboo' : 'Characters'}) (7 tai)`);
      break;
    }
  }

  // Mixed One Suit (One Suit + Honors)
  for (let suit of suits) {
    const suitTiles = allTiles.filter(tile => tile.includes(suit));
    const honors = allTiles.filter(tile => tiles.honors.includes(tile));
    if (suitTiles.length > 0 && honors.length > 0 && (suitTiles.length + honors.length) === allTiles.length) {
      score += 3;
      tai.push(`Mixed One Suit (${suit === 'm' ? 'Dots' : suit === 's' ? 'Bamboo' : 'Characters'} + Honors) (3 tai)`);
      break;
    }
  }

  // All Terminals & Honors
  const terminalAndHonors = uniqueAllTiles.filter(tile =>
    (['1m', '9m', '1s', '9s', '1p', '9p'].includes(tile) || tiles.honors.includes(tile))
  );
  if (terminalAndHonors.length > 0 && terminalAndHonors.length === uniqueAllTiles.length) {
    score += 10;
    tai.push('All Terminals & Honors (10 tai)');
  }

  // Basic Sequence and Triplet detection (very simplified)
  // This part would need significant enhancement for proper Mahjong scoring
  const handForSets = [...hand]; // Use currentHand for finding sets

  // Count triplets
  const tileCounts = {};
  handForSets.forEach(tile => {
      tileCounts[tile] = (tileCounts[tile] || 0) + 1;
  });

  let detectedTriplets = 0;
  Object.entries(tileCounts).forEach(([tile, count]) => {
      detectedTriplets += Math.floor(count / 3);
      // Remove tiles used in triplets from handForSets to avoid double counting
      for (let i = 0; i < Math.floor(count / 3) * 3; i++) {
          const index = handForSets.indexOf(tile);
          if (index > -1) handForSets.splice(index, 1);
      }
  });

  // Count sequences (simplified)
  let detectedSequences = 0;
  ['m', 's', 'p'].forEach(suit => {
      const suitTilesInHand = handForSets.filter(tile => tile.includes(suit)).sort();
      for (let i = 0; i < suitTilesInHand.length - 2; i++) {
          const num1 = parseInt(suitTilesInHand[i].charAt(0));
          const num2 = parseInt(suitTilesInHand[i+1].charAt(0));
          const num3 = parseInt(suitTilesInHand[i+2].charAt(0));
          if (num2 === num1 + 1 && num3 === num2 + 1) {
              detectedSequences++;
              // Remove from list to avoid double counting
              suitTilesInHand.splice(i, 3);
              i = -1; // Reset loop to re-evaluate from beginning after removal
          }
      }
  });

  if (detectedSequences > 0) {
      tai.push(`Sequences: ${detectedSequences} found`);
  }
  if (detectedTriplets > 0) {
      tai.push(`Triplets: ${detectedTriplets} found`);
  }

  return { score, tai };
};