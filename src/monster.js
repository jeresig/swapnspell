import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

export default class Monster {
    constructor(options) {
        this.options = {
            size: 50,
            x: 0,
            y: 0,
            interactive: false,
            ...options,
        };

        this.active = false;
        this.skin = "default";
    }

    damage(num) {
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
        const {curHealth, maxHealth} = this.options.monster;

        const monster = new Spine(sheets.monster.spineData);
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height, x: spineX, y: spineY} = monster.spineData;
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

        this.text = new PIXI.Text(`${curHealth}/${maxHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });

        this.text.x = x;
        this.text.y = y - 24;

        container.addChild(this.text);
    }
}