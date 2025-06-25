const SEASONS = [
    { id: 's1', name: 'Spring (春)', value: 1, group: 'SEASONS', unicode: '🀢' },
    { id: 's2', name: 'Summer (夏)', value: 2, group: 'SEASONS', unicode: '🀣' },
    { id: 's3', name: 'Autumn (秋)', value: 3, group: 'SEASONS', unicode: '🀤' },
    { id: 's4', name: 'Winter (冬)', value: 4, group: 'SEASONS', unicode: '🀥' },
];

const FLOWERS = [
    { id: 'f1', name: 'Plum (梅)', value: 1, group: 'FLOWERS', unicode: '🀦' },
    { id: 'f2', name: 'Orchid (蘭)', value: 2, group: 'FLOWERS', unicode: '🀧' },
    { id: 'f3', name: 'Chrysanthemum (菊)', value: 3, group: 'FLOWERS', unicode: '🀨' },
    { id: 'f4', name: 'Bamboo (竹)', value: 4, group: 'FLOWERS', unicode: '🀩' },
];

const ANIMALS = [
    { id: 'a1', name: 'Cat (貓)', group: 'ANIMALS', value: 1 },
    { id: 'a2', name: 'Rat (鼠)', group: 'ANIMALS', value: 2 },
    { id: 'a3', name: 'Rooster (公鸡)', group: 'ANIMALS', value: 3 },
    { id: 'a4', name: 'Centipede (蜈蚣)', group: 'ANIMALS', value: 4 },
];

export const FLOWER_TILES = {
    SEASONS,
    FLOWERS,
    ANIMALS,
};

export const ALL_FLOWER_TILES = [...SEASONS, ...FLOWERS, ...ANIMALS];

const createSuit = (suit, count, name_zh_prefix) => 
    Array.from({ length: count }, (_, i) => ({
        id: `${suit}${i + 1}`,
        name: `${i + 1} ${suit}`,
        name_zh: `${['一', '二', '三', '四', '五', '六', '七', '八', '九'][i]}${name_zh_prefix}`,
        suit: suit,
        value: i + 1,
        unicode: (suit === 'Dots' ? ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏']
            : suit === 'Bamboo' ? ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘']
            : ['🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'])[i]
    }));

export const SUITS = {
    DOTS: createSuit('Dots', 9, '筒'),
    BAMBOO: createSuit('Bamboo', 9, '索'),
    CHARACTERS: createSuit('Characters', 9, '萬'),
};

export const HONORS = {
    WINDS: [
        { id: 'E', name: 'East Wind', name_zh: '東', suit: 'Wind', value: 'E', unicode: '🀀' },
        { id: 'S', name: 'South Wind', name_zh: '南', suit: 'Wind', value: 'S', unicode: '🀁' },
        { id: 'W', name: 'West Wind', name_zh: '西', suit: 'Wind', value: 'W', unicode: '🀂' },
        { id: 'N', 'name': 'North Wind', name_zh: '北', suit: 'Wind', value: 'N', unicode: '🀃' },
    ],
    DRAGONS: [
        { id: 'Red', name: 'Red Dragon (中)', name_zh: '中', suit: 'Dragon', value: 'Red', unicode: '🀄︎' },
        { id: 'Green', name: 'Green Dragon (發)', name_zh: '發', suit: 'Dragon', value: 'Green', unicode: '🀅' },
        { id: 'White', name: 'White Dragon (白)', name_zh: '白', suit: 'Dragon', value: 'White', unicode: '🀆' },
    ]
};

export const ALL_PLAYING_TILES = [
    ...SUITS.DOTS, ...SUITS.BAMBOO, ...SUITS.CHARACTERS,
    ...HONORS.WINDS, ...HONORS.DRAGONS
];

// Mahjong pattern detection framework
const patterns = [
  {
    name: 'Thirteen Orphans (十三么)',
    tai: 5,
    detect: (hand) => {
      // 1 & 9 of each suit, all winds, all dragons, and any pair
      const required = [
        // 1 & 9 of each suit
        'Dots1','Dots9','Bamboo1','Bamboo9','Characters1','Characters9',
        // Winds
        'E','S','W','N',
        // Dragons
        'Red','Green','White'
      ];
      const ids = hand.map(t => t.id);
      const unique = new Set(ids);
      let hasAll = required.every(id => unique.has(id));
      // Must have 14 tiles and a pair of any of the required
      let pairFound = false;
      for (let id of required) {
        if (ids.filter(x => x === id).length === 2) pairFound = true;
      }
      return hand.length === 14 && hasAll && pairFound;
    }
  },
  {
    name: 'Seven Pairs (七对子)',
    tai: 5,
    detect: (hand) => {
      if (hand.length !== 14) return false;
      const counts = {};
      hand.forEach(tile => { counts[tile.id] = (counts[tile.id] || 0) + 1; });
      return Object.values(counts).every(v => v === 2);
    }
  },
  {
    name: 'Full-Colour Ping Hu (Same Suit + Ping Hu)',
    tai: 5,
    detect: (hand) => {
      // All tiles from same suit, and isPingHu
      const suits = hand.filter(t => t.group === 'SUITS').map(t => t.suit);
      const uniqueSuits = new Set(suits);
      const bigCards = hand.filter(t => t.group === 'HONORS');
      return uniqueSuits.size === 1 && bigCards.length === 0 && isPingHu(hand);
    }
  },
  {
    name: 'Full-Colour (Same Suit Only)',
    tai: 4,
    detect: (hand) => {
      const suits = hand.filter(t => t.group === 'SUITS').map(t => t.suit);
      const uniqueSuits = new Set(suits);
      const bigCards = hand.filter(t => t.group === 'HONORS');
      return uniqueSuits.size === 1 && bigCards.length === 0;
    }
  },
  {
    name: 'Half-Colour Pong Pong (Same Suit + Big Cards + All Pungs)',
    tai: 4,
    detect: (hand) => {
      const suits = hand.filter(t => t.group === 'SUITS').map(t => t.suit);
      const uniqueSuits = new Set(suits);
      const bigCards = hand.filter(t => t.group === 'HONORS');
      return uniqueSuits.size === 1 && bigCards.length <= 2 && isPongPong(hand);
    }
  },
  {
    name: 'Ping Hu (平胡 / All Chows)',
    tai: 4,
    detect: (hand) => isPingHu(hand)
  },
  {
    name: 'Pong Pong (對對胡 / All Pungs)',
    tai: 2,
    detect: (hand) => isPongPong(hand)
  },
  {
    name: 'Half-Colour (Same Suit + Big Cards)',
    tai: 2,
    detect: (hand) => {
      const suits = hand.filter(t => t.group === 'SUITS').map(t => t.suit);
      const uniqueSuits = new Set(suits);
      const bigCards = hand.filter(t => t.group === 'HONORS');
      return uniqueSuits.size === 1 && bigCards.length <= 2;
    }
  },
  {
    name: 'Cao Ping Hu (草平胡 / Ruined Ping Hu)',
    tai: 1,
    detect: (hand, playerWind, tableWind, flowers, animals) => {
      return isPingHu(hand) && ((flowers && flowers.length > 0) || (animals && animals.length > 0));
    }
  },
  {
    name: 'Mixed (Chows and Pungs)',
    tai: 0,
    detect: (hand) => isMixedHand(hand)
  },
];

// Helper: Pong Pong (All Pungs)
function isPongPong(hand) {
  if (hand.length !== 14) return false;
  // Count occurrences of each tile
  const counts = {};
  hand.forEach(tile => { counts[tile.id] = (counts[tile.id] || 0) + 1; });
  const values = Object.values(counts);
  // Must have exactly 5 unique tile types: 4 pungs (3 each), 1 pair (2)
  if (values.length !== 5) return false;
  if (values.filter(v => v === 3).length !== 4) return false;
  if (values.filter(v => v === 2).length !== 1) return false;
  if (values.some(v => v > 3)) return false; // No kongs allowed
  return true;
}

// Helper: Recursively check if the remaining tiles can form n pungs (no kongs/quads)
function canFormPungsStrict(counts, n) {
  if (n === 0) {
    // All pungs formed, check if all tiles are used
    return Object.values(counts).every(v => v === 0);
  }
  // Try to find a pung (3 of a kind, not 4)
  for (const [tileId, count] of Object.entries(counts)) {
    if (count === 3) {
      const newCounts = { ...counts };
      newCounts[tileId] -= 3;
      if (canFormPungsStrict(newCounts, n - 1)) {
        return true;
      }
    }
  }
  return false;
}

// Check if any suit group contains a chow (sequence) in the remaining tiles
function hasChowLeft(counts) {
  const suitGroups = ['Dots', 'Bamboo', 'Characters'];
  for (const suit of suitGroups) {
    // Get all tile numbers for this suit
    const nums = Object.keys(counts)
      .filter(id => id.startsWith(suit) && counts[id] > 0)
      .map(id => parseInt(id.replace(suit, '')))
      .sort((a, b) => a - b);
    // Check for any sequence of 3 consecutive numbers
    for (let i = 0; i < nums.length - 2; i++) {
      if (
        counts[`${suit}${nums[i]}`] > 0 &&
        counts[`${suit}${nums[i + 1]}`] > 0 &&
        counts[`${suit}${nums[i + 2]}`] > 0
      ) {
        return true;
      }
    }
  }
  return false;
}

// Helper: Ping Hu (All Chows + 1 pair, no big cards in pair, no longkang wait)
function isPingHu(hand) {
  if (hand.length !== 14) return false;
  // Count occurrences of each tile
  const counts = {};
  hand.forEach(tile => { counts[tile.id] = (counts[tile.id] || 0) + 1; });

  // Try all possible pairs (must not be an honor tile)
  for (const [tileId, count] of Object.entries(counts)) {
    // Only allow pair in suits, not honors
    if (count >= 2 && !isHonorTile(tileId)) {
      const newCounts = { ...counts };
      newCounts[tileId] -= 2;
      if (canFormChowsOnly(newCounts, 4)) {
        return true;
      }
    }
  }
  return false;
}

// Helper: Recursively check if the remaining tiles can form n chows (no pungs allowed)
function canFormChowsOnly(counts, n) {
  if (n === 0) {
    // All chows formed, check if all tiles are used
    return Object.values(counts).every(v => v === 0);
  }
  // Only try to find a chow (no pungs)
  const suits = ['Dots', 'Bamboo', 'Characters'];
  for (const suit of suits) {
    const nums = Object.keys(counts)
      .filter(id => id.startsWith(suit) && counts[id] > 0)
      .map(id => parseInt(id.replace(suit, '')))
      .sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 2; i++) {
      const n1 = nums[i], n2 = nums[i + 1], n3 = nums[i + 2];
      if (
        n2 === n1 + 1 && n3 === n2 + 1 &&
        counts[`${suit}${n1}`] > 0 &&
        counts[`${suit}${n2}`] > 0 &&
        counts[`${suit}${n3}`] > 0
      ) {
        const newCounts = { ...counts };
        newCounts[`${suit}${n1}`]--;
        newCounts[`${suit}${n2}`]--;
        newCounts[`${suit}${n3}`]--;
        if (canFormChowsOnly(newCounts, n - 1)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Helper: Check if a tile is an honor tile (winds or dragons)
function isHonorTile(tileId) {
  return (
    tileId === 'E' || tileId === 'S' || tileId === 'W' || tileId === 'N' ||
    tileId === 'Red' || tileId === 'Green' || tileId === 'White'
  );
}

// Helper: Mixed (Chows and Pungs, not all chows or all pungs)
function isMixedHand(hand) {
  if (hand.length !== 14) return false;
  // Must not be all chows or all pungs
  if (isPingHu(hand) || isPongPong(hand)) return false;
  // Try all possible pairs
  const counts = {};
  hand.forEach(tile => { counts[tile.id] = (counts[tile.id] || 0) + 1; });
  for (const [tileId, count] of Object.entries(counts)) {
    if (count >= 2) {
      const newCounts = { ...counts };
      newCounts[tileId] -= 2;
      if (canFormSets(newCounts, 4)) {
        return true;
      }
    }
  }
  return false;
}

// Helper: Recursively check if the remaining tiles can form n sets (chow or pung)
function canFormSets(counts, n) {
  if (n === 0) {
    return Object.values(counts).every(v => v === 0);
  }
  // Try to find a pung
  for (const [tileId, count] of Object.entries(counts)) {
    if (count >= 3) {
      const newCounts = { ...counts };
      newCounts[tileId] -= 3;
      if (canFormSets(newCounts, n - 1)) {
        return true;
      }
    }
  }
  // Try to find a chow
  const suits = ['Dots', 'Bamboo', 'Characters'];
  for (const suit of suits) {
    const nums = Object.keys(counts)
      .filter(id => id.startsWith(suit) && counts[id] > 0)
      .map(id => parseInt(id.replace(suit, '')))
      .sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 2; i++) {
      const n1 = nums[i], n2 = nums[i + 1], n3 = nums[i + 2];
      if (
        n2 === n1 + 1 && n3 === n2 + 1 &&
        counts[`${suit}${n1}`] > 0 &&
        counts[`${suit}${n2}`] > 0 &&
        counts[`${suit}${n3}`] > 0
      ) {
        const newCounts = { ...counts };
        newCounts[`${suit}${n1}`]--;
        newCounts[`${suit}${n2}`]--;
        newCounts[`${suit}${n3}`]--;
        if (canFormSets(newCounts, n - 1)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Main detection function: returns highest tai pattern
export function detectBestPattern(hand, playerWind, tableWind, flowers, animals) {
  for (const pattern of patterns) {
    if (pattern.detect(hand, playerWind, tableWind, flowers, animals)) {
      return { pattern: pattern.name, tai: pattern.tai };
    }
  }
  // If no pattern matches, return Incomplete Hand
  return { pattern: 'Incomplete Hand', tai: 0 };
}

// Returns extra tai for pongs/kongs of seat wind and prevailing wind
export function countWindTai(hand, playerWind, tableWind) {
  // Acceptable wind tile ids: 'E', 'S', 'W', 'N'
  // playerWind: e.g. 'East (東)', tableWind: e.g. 'East (東風)'
  const windMap = {
    'East (東)': 'E',
    'South (南)': 'S',
    'West (西)': 'W',
    'North (北)': 'N',
    'East (東風)': 'E',
    'South (南風)': 'S',
    'West (西風)': 'W',
    'North (北風)': 'N',
  };
  const seatWindId = windMap[playerWind];
  const tableWindId = windMap[tableWind];
  // Count pongs/kongs of each wind
  const counts = { E: 0, S: 0, W: 0, N: 0 };
  hand.forEach(tile => {
    if (counts.hasOwnProperty(tile.id)) {
      counts[tile.id]++;
    }
  });
  let tai = 0;
  // Pong/kong = 3 or 4 of a wind
  if (seatWindId && counts[seatWindId] >= 3) tai++;
  if (tableWindId && counts[tableWindId] >= 3) tai++;
  return tai;
}