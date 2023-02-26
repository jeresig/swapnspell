import * as PIXI from "pixi.js";

import Monster from "./monster.js";
import Hero from "./hero.js";

export default class Battlefield {
    constructor(options) {
        this.options = {
            monsters: [],
            numMonsterSlots: 3,
            onAttacked: (num) => {},
            ...options,
        };

        const {sheets, gridHeight, gridWidth, numMonsterSlots, monsters, x, y, health} = this.options;

        const battlefield = new PIXI.Container();
        battlefield.x = x;
        battlefield.y = y;
        this.options.container.addChild(battlefield);

        const monsterSlots = this.monsterSlots = [];

        for (let h = 0; h < numMonsterSlots; h += 1) {
            if (monsters.length > 0) {
                const curMonster = monsters.pop();
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
            x: 50,
            y: 100,
            size: 50,
        });
    }

    attack(foundWords) {
        for (const word of foundWords) {
            if (word.dir === "horizontal") {
                if (this.monsterSlots[word.y]) {
                    this.monsterSlots[word.y].damage(word.length * (word.length - 2));
                }
            } else {
                // TODO
            }
        }

        if (foundWords.length > 0) {
            return this.hero.attack();
        }

        return Promise.resolve();
    }

    endTurn() {
        let pos = 0;
        for (const monsterSlot of this.monsterSlots) {
            if (monsterSlot) {
                if (monsterSlot.options.monster.alive) {
                    const damage = monsterSlot.options.monster.attack();
                    setTimeout(() => {
                        this.hero.damage(damage);
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