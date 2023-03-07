import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

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
    monster: Spine;
    health: Spine;

    constructor(options: Options) {
        this.options = options;
        this.active = false;
        this.skin = "default";

        const {sheets} = this.options;
        const {curHealth, maxHealth} = this.options.monster;
        this.text = new PIXI.Text(`${curHealth}/${maxHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });

        this.monster = new Spine(sheets.monster.spineData);
        this.health = new Spine(sheets.monster.spineData);
    }

    damage(num: number) {
        const {monster} = this.options;

        if (monster.curHealth <= 0) {
            return;
        }

        monster.curHealth = Math.max(0, monster.curHealth - num);

        this.updateHealth();

        if (monster.curHealth <= 0) {
            monster.alive = false;
            this.monster.state.setAnimation(0, 'goblin_axe_death', false);
        } else {
            this.monster.state.setAnimation(0, 'goblin_axe_hit', false);
            this.monster.state.addAnimation(0, 'goblin_axe_idle', true, 0);
        }
    }

    attack(): number {
        this.monster.state.setAnimation(0, 'goblin_axe_attack', false);
        this.monster.state.addAnimation(0, 'goblin_axe_idle', true, 0);

        return this.options.monster.attack();
    }

    addSkin(skin: Skin, skinName: string) {
        const {monster} = this;
        const foundSkin = monster.spineData.findSkin(skinName);
        if (foundSkin) {
            // @ts-ignore This is ok
            skin.addSkin(foundSkin);
        } else {
            console.error("Skin not found", skinName);
        }
    }

    updateHealth() {
        const health = this.health;
        const {curHealth, maxHealth} = this.options.monster;
        const anim = health.state.setAnimation(1, 'enemy_health_scrub', false);
        anim.timeScale = 0;
        if (curHealth <= 0) {
            anim.trackTime = -1;
        } else {
            anim.trackTime = anim.animationEnd * (curHealth / maxHealth);
        }
    }

    render() {
        const {x, y, size, container, sheets} = this.options;

        const monster = this.monster;
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height} = monster.spineData;
        monster.x = x + 30;
        monster.y = y;
        const ratio = 90 / height;
        //monster.scale.x = -1 * ratio;
        //monster.scale.y = ratio;
        //monster.height = 165;
        //monster.scaleX = -1;

        const newSkin = new Skin("combined-skin");
        //this.addSkin(newSkin, `enemy_health_default`);
        this.addSkin(newSkin, `goblin_axe_default`);
        // @ts-ignore setSkin exists
        monster.skeleton.setSkin(newSkin);
        monster.skeleton.setSlotsToSetupPose();

        monster.state.addAnimation(0, 'goblin_axe_idle', true, Math.random() / 2);
        //monster.state.setAnimation(1, 'enemy_health_scrub', false);

        container.addChild(monster);

        const health = this.health;
        health.x = x + 25;
        health.y = y + 10;
        //const ratio = 90 / height;
        health.scale.x = 0.3;
        health.scale.y = 0.3;

        const newSkin2 = new Skin("combined-skin");
        this.addSkin(newSkin2, `enemy_health_default`);
        // @ts-ignore setSkin exists
        health.skeleton.setSkin(newSkin2);
        health.skeleton.setSlotsToSetupPose();

        this.updateHealth();

        container.addChild(this.health);
    }
}