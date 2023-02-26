import * as PIXI from "pixi.js";

import Battlefield from "./battlefield.js";
import SpellBook from "./spellbook.js";

export default class Level {
    constructor(options) {
        this.options = {
            gridWidth: 5,
            gridHeight: 5,
            prefilledLetters: null,
            horizontalWords: true,
            verticalWords: false,
            minWordSize: 3,
            health: 50,
            ...options,
        };

        const level = new PIXI.Container();
        level.x = 0;
        level.y = 0;
        this.options.container.addChild(level);

        this.battlefield = new Battlefield({
            ...this.options,
            container: level,
            width: this.options.width,
            height: 300,
            x: 0,
            y: 0,
        });

        this.spellBook = new SpellBook({
            ...this.options,
            container: level,
            width: this.options.width,
            height: 500,
            x: 0,
            y: this.options.height - 500,
            onCastSpell: this.handleCastSpell,
        });
    }

    handleCastSpell = async (foundWords) => {
        console.log(foundWords);
        await this.battlefield.attack(foundWords);
        this.battlefield.endTurn();
    }

    render() {
        this.battlefield.render();
        this.spellBook.render();
    }
}