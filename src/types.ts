export type MonsterType = {
    maxHealth: number,
    curHealth: number,
    alive: boolean,
    attack: () => number,
}

export type LevelType = {
    horizontalWords: boolean,
    verticalWords: boolean,
    gridWidth: number,
    gridHeight: number,
    minWordSize: number,
    numMonsterSlots: number,
    monsters: Array<MonsterType>,
};

export type CastWord = {
    word: string,
    length: number,
    dir: "vertical" | "horizontal",
    color: string,
    x: number,
    y: number,
};
