import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';

import {MonsterType} from "./types";

type Options = {
    size: number,
    x: number,
    y: number,
    container: PIXI.Container,
    monster: MonsterType,
    sheets: any,
}

export default class Monster {
    options: Options;
    active: boolean;
    skin: string;
    text: PIXI.Text;

    constructor(options: Options) {
        this.options = options;
        this.active = false;
        this.skin = "default";

        const {curHealth, maxHealth} = this.options.monster;
        this.text = new PIXI.Text(`${curHealth}/${maxHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });
    }

    damage(num: number) {
        const {monster} = this.options;
        monster.curHealth -= num;
        if (monster.curHealth <= 0) {
            monster.alive = false;
            this.text.text = `💀`;
        } else {
            this.text.text = `${monster.curHealth}/${monster.maxHealth}`;
        }
    }

    render() {
        const {x, y, size, container, sheets} = this.options;

        const monster = new Spine(sheets.monster.spineData);
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height} = monster.spineData;
        monster.x = x + 30;
        monster.y = y;
        const ratio = 90 / height;
        monster.scale.x = -1 * ratio;
        monster.scale.y = ratio;
        //monster.height = 165;
        //monster.scaleX = -1;

        monster.skeleton.setSkinByName('goblin');
        monster.skeleton.setSlotsToSetupPose();
        //monster.state.setAnimation(0, 'walk', true);

        container.addChild(monster);

        this.text.x = x;
        this.text.y = y - 24;

        container.addChild(this.text);
    }
}