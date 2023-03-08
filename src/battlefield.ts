import * as PIXI from "pixi.js";

import Monster from "./monster";
import Hero from "./hero";
import { LevelType, MonsterType, CastWord } from "./types";

type Options = {
    level: LevelType,
    sheets: any,
    x: number,
    y: number,
    width: number,
    height: number,
    health: number,
    container: PIXI.Container,
}

export default class Battlefield {
    options: Options;
    monsterSlots: Array<Monster>;
    hero: Hero;

    constructor(options: Options) {
        this.options = options;

        const {sheets, x, y, health, level: {numMonsterSlots, monsters}} = this.options;

        const battlefield = new PIXI.Container();
        battlefield.x = x;
        battlefield.y = y;
        this.options.container.addChild(battlefield);

        const monsterSlots: Array<Monster> = this.monsterSlots = [];

        for (let h = 0; h < numMonsterSlots; h += 1) {
            const curMonster: MonsterType | undefined = monsters.pop();
            if (curMonster) {
                monsterSlots.push(new Monster({
                    container: battlefield,
                    sheets,
                    x: 290,
                    y: (h + 1) * 90,
                    size: 50,
                    monster: curMonster,
                }));
            }
        }

        this.hero = new Hero({
            container: battlefield,
            maxHealth: health,
            sheets,
            x: 70,
            y: 100,
            size: 50,
        });
    }

    attack(foundWords: Array<CastWord>) {
        if (foundWords.length > 0) {
            setTimeout(() => {
                for (const word of foundWords) {
                    if (word.dir === "horizontal") {
                        if (this.monsterSlots[word.y]) {
                            this.monsterSlots[word.y].damage(word.length * (word.length - 2));
                        }
                    } else {
                        // TODO
                    }
                }
            }, 600);
            return this.hero.attack();
        }

        return Promise.resolve();
    }

    endTurn() {
        let pos = 0;
        for (const monsterSlot of this.monsterSlots) {
            if (monsterSlot) {
                if (monsterSlot.options.monster.alive) {
                    setTimeout(() => {
                        const damage = monsterSlot.attack();
                        setTimeout(() => {
                            this.hero.damage(damage);
                        }, 1500);
                    }, pos * 400);
                    pos += 1;
                } else {
                    // TODO: Remove old monster, render new one
                }
            }
        }
    }

    render() {
        for (const monsterSlot of this.monsterSlots) {
            monsterSlot.render();
        }

        this.hero.render();
    }
}