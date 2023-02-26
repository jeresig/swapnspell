import {LevelType} from "./types";

export const width = 360;
export const height = 780;

export const LEVELS: Array<LevelType> = [
    {
        horizontalWords: true,
        verticalWords: false,
        gridWidth: 4,
        gridHeight: 3,
        minWordSize: 3,
        numMonsterSlots: 3,
        monsters: [
            {maxHealth: 10, curHealth: 10, alive: true, attack: () => 5},
            {maxHealth: 20, curHealth: 20, alive: true, attack: () => 3},
            {maxHealth: 30, curHealth: 30, alive: true, attack: () => 2},
        ],
    },
    {
        horizontalWords: true,
        verticalWords: false,
        gridWidth: 4,
        gridHeight: 4,
        minWordSize: 3,
        numMonsterSlots: 3,
        monsters: [
            {maxHealth: 10, curHealth: 10, alive: true, attack: () => 5},
            {maxHealth: 20, curHealth: 20, alive: true, attack: () => 3},
            {maxHealth: 30, curHealth: 30, alive: true, attack: () => 2},
        ],
    },
    {
        horizontalWords: true,
        verticalWords: false,
        gridWidth: 5,
        gridHeight: 4,
        minWordSize: 4,
        numMonsterSlots: 3,
        monsters: [
            {maxHealth: 10, curHealth: 10, alive: true, attack: () => 5},
            {maxHealth: 20, curHealth: 20, alive: true, attack: () => 3},
            {maxHealth: 30, curHealth: 30, alive: true, attack: () => 2},
        ],
    },
    {
        horizontalWords: true,
        verticalWords: false,
        gridWidth: 4,
        gridHeight: 4,
        minWordSize: 4,
        numMonsterSlots: 3,
        monsters: [
            {maxHealth: 10, curHealth: 10, alive: true, attack: () => 5},
            {maxHealth: 20, curHealth: 20, alive: true, attack: () => 3},
            {maxHealth: 30, curHealth: 30, alive: true, attack: () => 2},
        ],
    },
];

// Letter data
// Distribution of OSPD4 + OpenOffice en_US + Wiktionary English
export const letterData = {
    letters: {
        a:77,
        d:38,
        h:23,
        e:111,
        i:75,
        n:58,
        g:27,
        s:85,
        k:13,
        l:53,
        m:27,
        b:21,
        o:61,
        r:68,
        v:9,
        w:10,
        f:14,
        t:57,
        z:4,
        c:36,
        u:34,
        p:28,
        y:17,
        j:2,
        x:3,
        q:2
    },
    total: 953
};