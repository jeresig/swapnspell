import * as PIXI from "pixi.js";

import Battlefield from "./battlefield";
import SpellBook from "./spellbook";
import {CastWord, LevelType} from "./types";

type Options = {
    level: LevelType,
    health: number,
    width: number,
    height: number,
    container: PIXI.Container;
    sheets: any;
}

export default class Level {
    options: Options;
    battlefield: Battlefield;
    spellBook: SpellBook;

    constructor(options: Options) {
        this.options = options;

        const container = new PIXI.Container();
        container.x = 0;
        container.y = 0;
        this.options.container.addChild(container);

        this.battlefield = new Battlefield({
            container,
            sheets: this.options.sheets,
            width: this.options.width,
            height: 300,
            x: 0,
            y: 0,
            level: this.options.level,
            health: this.options.health,
        });

        this.spellBook = new SpellBook({
            container,
            sheets: this.options.sheets,
            width: this.options.width,
            height: 500,
            x: 0,
            y: this.options.height - 500,
            level: this.options.level,
            onCastSpell: this.handleCastSpell,
        });
    }

    handleCastSpell = async (foundWords: Array<CastWord>) => {
        await this.battlefield.attack(foundWords);
        this.battlefield.endTurn();
    }

    render() {
        this.battlefield.render();
        this.spellBook.render();
    }
}