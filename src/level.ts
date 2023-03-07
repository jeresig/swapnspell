import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';

import Battlefield from "./battlefield";
import SpellBook from "./spellbook";
import {CastWord, LevelType} from "./types";

type Options = {
    root: PIXI.Container,
    level: LevelType,
    health: number,
    width: number,
    height: number,
    container: PIXI.Container;
    sheets: any;
}

export default class Level {
    container: PIXI.Container;
    options: Options;
    battlefield: Battlefield;
    spellBook: SpellBook;

    constructor(options: Options) {
        this.options = options;

        const container = this.container = new PIXI.Container();
        container.x = 0;
        container.y = 0;
        this.options.container.addChild(container);

        const {sheets, width, height, root} = this.options;
        const background = new Spine(sheets.background.spineData);

        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width: bgWidth, height: bgHeight} = background.spineData;
        background.x = width / 2;
        background.y = height / 2;
        const wRatio = width / bgWidth;
        //const hRatio = height / bgHeight;
        //const ratio = Math.max(wRatio, hRatio);
        console.log(wRatio, width, bgWidth);
        background.scale.x = wRatio;
        background.scale.y = wRatio;
        //monster.height = 165;
        //monster.scaleX = -1;

        background.skeleton.setSkinByName('default');
        background.skeleton.setSlotsToSetupPose();
        background.state.setAnimation(0, 'world_bg_1_1', true);

        this.container.addChild(background);

        this.battlefield = new Battlefield({
            container,
            sheets: this.options.sheets,
            width: this.options.width,
            height: this.options.height / 2,
            x: 0,
            y: 80,
            level: this.options.level,
            health: this.options.health,
        });

        this.spellBook = new SpellBook({
            root,
            container,
            sheets: this.options.sheets,
            width: this.options.width,
            height: this.options.height / 2,
            x: 0,
            y: this.options.height / 2,
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