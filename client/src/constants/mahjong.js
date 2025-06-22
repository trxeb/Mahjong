const SEASONS = [
    { id: 's1', name: 'Spring (春)', value: 1, group: 'SEASONS' },
    { id: 's2', name: 'Summer (夏)', value: 2, group: 'SEASONS' },
    { id: 's3', name: 'Autumn (秋)', value: 3, group: 'SEASONS' },
    { id: 's4', name: 'Winter (冬)', value: 4, group: 'SEASONS' },
];

const FLOWERS = [
    { id: 'f1', name: 'Plum (梅)', value: 1, group: 'FLOWERS' },
    { id: 'f2', name: 'Orchid (蘭)', value: 2, group: 'FLOWERS' },
    { id: 'f3', name: 'Chrysanthemum (菊)', value: 3, group: 'FLOWERS' },
    { id: 'f4', name: 'Bamboo (竹)', value: 4, group: 'FLOWERS' },
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