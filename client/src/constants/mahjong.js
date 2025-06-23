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
        { id: 'Red', name: 'Red Dragon (中)', name_zh: '中', suit: 'Dragon', value: 'Red', unicode: '🀄' },
        { id: 'Green', name: 'Green Dragon (發)', name_zh: '發', suit: 'Dragon', value: 'Green', unicode: '🀅' },
        { id: 'White', name: 'White Dragon (白)', name_zh: '白', suit: 'Dragon', value: 'White', unicode: '🀆' },
    ]
};

export const ALL_PLAYING_TILES = [
    ...SUITS.DOTS, ...SUITS.BAMBOO, ...SUITS.CHARACTERS,
    ...HONORS.WINDS, ...HONORS.DRAGONS
];