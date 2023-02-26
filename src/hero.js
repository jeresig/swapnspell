import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

export default class Hero {
    constructor(options) {
        this.options = {
            size: 50,
            x: 0,
            y: 0,
            interactive: false,
            ...options,
        };

        this.skin = "default";
        this.maxHealth = this.options.maxHealth;
        this.curHealth = this.maxHealth;
    }

    damage(num) {
        const {container} = this.options;

        this.curHealth -= num;
        if (this.curHealth <= 0) {
            this.alive = false;
        }

        this.healthText.text = `Health: ${this.curHealth}/${this.maxHealth}`;

        this.damageText = new PIXI.Text(`-${num}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0xff0000,
        });
        this.damageText.x = 50;
        this.damageText.y = 200;
        this.damageText.alpha = 1;
        container.addChild(this.damageText);

        const duration = 333;
        const ticker = PIXI.Ticker.shared;

        const onTick = (deltaTime) => {
          const deltaMS = deltaTime / PIXI.settings.TARGET_FPMS;

          // increase the alpha proportionally
          this.damageText.alpha -= deltaMS / duration;

          if (this.damageText.alpha >= 1) {
            ticker.remove(onTick);
            container.removeChild(this.damageText);
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
        this.hero.state.addAnimation(0, 'idle', true);

        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    render() {
        const {x, y, size, container, sheets} = this.options;

        const hero = this.hero = new Spine(sheets.hero.spineData);
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height, x: spineX, y: spineY} = hero.spineData;
        hero.x = x + 30;
        hero.y = y + 100;
        const ratio = 90 / height;
        //hero.scale.x = ratio;
        //hero.scale.y = ratio;
        //hero.height = 165;
        //hero.scaleX = -1;

        hero.skeleton.setSkinByName(this.skin);
        hero.skeleton.setSlotsToSetupPose();
        hero.state.setAnimation(0, 'idle', true);

        container.addChild(hero);

        this.healthText = new PIXI.Text(`Health: ${this.curHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });
        this.healthText.x = 0;
        this.healthText.y = 0;
        container.addChild(this.healthText);

        /*
        this.text = new PIXI.Text(`${curHealth}/${maxHealth}`, {
            fontFamily: "Helvetica",
            fontSize: 24,
            fill: 0x00ff00,
        });

        this.text.x = x;
        this.text.y = y - 24;

        container.addChild(this.text);
        */
    }
}