import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

type Options = {
    size: number,
    x: number,
    y: number,
    maxHealth: number,
    container: PIXI.Container,
    sheets: any,
}

export default class Hero {
    options: Options;
    skin: string;
    maxHealth: number;
    curHealth: number;
    alive: boolean;
    healthText: PIXI.Text;
    hero: Spine;

    constructor(options: Options) {
        this.options = options;
        this.skin = "default";
        this.maxHealth = this.options.maxHealth;
        this.curHealth = this.maxHealth;
        this.alive = true;

        this.hero = new Spine(this.options.sheets.hero.spineData);
        this.healthText = new PIXI.Text(`Health: ${this.curHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });
    }

    damage(num: number) {
        const {container} = this.options;

        this.curHealth -= num;
        if (this.curHealth <= 0) {
            this.alive = false;
        }

        this.healthText.text = `Health: ${this.curHealth}/${this.maxHealth}`;

        const damageText = new PIXI.Text(`-${num}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0xff0000,
        });
        damageText.x = 50;
        damageText.y = 200;
        damageText.alpha = 1;
        container.addChild(damageText);

        const duration = 333;
        const ticker = PIXI.Ticker.shared;
        const frameRate = PIXI.settings.TARGET_FPMS || 0.06;

        const onTick = (deltaTime: number) => {
          const deltaMS = deltaTime / frameRate;

          // increase the alpha proportionally
          damageText.alpha -= deltaMS / duration;

          if (damageText.alpha >= 1) {
            ticker.remove(onTick);
            container.removeChild(damageText);
          }
        };

        ticker.add(onTick);

        this.hero.state.setAnimation(0, 'hit', false);

        setTimeout(() => {
            if (this.curHealth <= 0) {
                this.hero.state.setAnimation(0, 'death', false);
                this.healthText.alpha = 0;
            } else {
                this.hero.state.setAnimation(0, 'idle', true);
            }
        }, 333);
    }

    attack() {
        this.hero.state.setAnimation(0, 'attack_1', false);
        this.hero.state.addAnimation(0, 'idle', true, 0);

        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    render() {
        const {x, y, size, container, sheets} = this.options;

        const hero = this.hero;
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height} = hero.spineData;
        hero.x = x + 30;
        hero.y = y + 100;

        hero.skeleton.setSkinByName(this.skin);
        hero.skeleton.setSlotsToSetupPose();
        hero.state.setAnimation(0, 'idle', true);

        container.addChild(hero);

        this.healthText.x = 0;
        this.healthText.y = 0;
        container.addChild(this.healthText);
    }
}