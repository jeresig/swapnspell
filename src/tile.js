import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

export default class Tile {
    constructor(options) {
        this.options = {
            size: 50,
            x: 0,
            y: 0,
            interactive: true,
            letter: "A",
            type: "default",
            ...options,
        };

        this.active = false;
        this.isPartOfHorizontalWord = false;
        this.isPartOfVerticalWord = false;
        this.pos = this.options.pos;
        this.letter = this.options.letter;
        this.type = this.options.type;
        this.castType = this.options.type;
    }

    handleTap = () => {
        this.options.onActivate();
    }

    setInactive() {
        this.active = false;
        this.updateHighlight();
    }

    setActive() {
        this.active = true;
        this.updateHighlight();
    }

    setTouchDown() {
        this.touchDown = true;
        this.updateHighlight();
    }

    setTouchUp() {
        this.touchDown = false;
        this.updateHighlight();
    }

    setIsNotPartOfVerticalWord() {
        this.isPartOfVerticalWord = false;
        //this.updateHighlight();
    }

    setIsPartOfVerticalWord() {
        this.isPartOfVerticalWord = true;
        //this.updateHighlight();
    }

    setIsNotPartOfHorizontalWord() {
        this.isPartOfHorizontalWord = false;
        this.posInWord = 0;
        this.castType = this.type;
        if (!this.swapping) {
            this.updateHighlight();
        }
    }

    setIsPartOfHorizontalWord(pos, castType) {
        this.isPartOfHorizontalWord = true;
        this.posInWord = pos;
        this.castType = castType;
        if (!this.swapping) {
            this.updateHighlight();
        }
        this.updateSkin();
    }

    swap(letter, type) {
        this.swapping = true;
        this.active = false;
        this.letter = letter;
        this.updateHighlight();

        setTimeout(() => {
            this.swapping = false;
            this.type = type;
            this.castType = type;
            //this.updateHighlight();
            this.updateSkin();
        }, 400);
    }

    cast(newLetter, type) {
        this.casting = true;
        this.letter = newLetter;
        this.updateHighlight();

        setTimeout(() => {
            this.casting = false;
            this.type = type;
            this.castType = type;
            //this.updateHighlight();
            this.updateSkin();
        }, 2000);
    }

    spawn() {
        this.spawning = true;
        this.updateHighlight();

        setTimeout(() => {
            this.spawning = false;
            this.updateHighlight();
        }, 233);
    }

    setLetter(letter, type) {
        this.letter = letter;
        this.type = type;
        this.castType = type;
        this.updateSkin();
    }

    updateSkin() {
        const {tile, type, castType, letter} = this;
        const newSkin = new Skin("combined-skin");
        newSkin.addSkin(tile.spineData.findSkin(`tile_magic/tile_magic_${this.castType}`));
        newSkin.addSkin(tile.spineData.findSkin(`colors/color_${this.type}`));
        newSkin.addSkin(tile.spineData.findSkin(`letters/letter_${letter.toLowerCase()}`));
        tile.skeleton.setSkin(newSkin);
        tile.skeleton.setSlotsToSetupPose();
    }

    setAnimation(track, name, repeat) {
        const curIntAnimation = this.tile.state.getCurrent(track)?.animation?.name;

        if (curIntAnimation !== name) {
            this.tile.state.setAnimation(track, name, repeat);
        }
    }

    updateHighlight() {
        const curIntAnimation = this.tile.state.getCurrent(0)?.animation?.name;

        if (this.spawning) {
            this.setAnimation(0, 'spawn', false);
        } else if (this.casting) {
            this.setAnimation(0, 'spell_cast_1', false);
        } else if (this.swapping) {
            this.setAnimation(0, 'swap', false);
        } else if (this.isPartOfHorizontalWord && this.isPartOfVerticalWord) {
            //this.sprite.tint = 0x00FF00; // green
        } else if (this.isPartOfHorizontalWord && this.posInWord > 0) {
            this.setAnimation(0, `word_active_tile_${this.posInWord}`, true);
        } else if (this.isPartOfVerticalWord && this.posInWord > 0) {
            this.setAnimation(0, `word_active_tile_${this.posInWord}`, true);
        } else {
            this.setAnimation(0, 'default_idle', true);
        }

        if (this.spawning) {
            this.setAnimation(1, 'spawn', false);
        } else if (this.casting) {
            this.setAnimation(1, 'spell_cast_1', false);
        } else if (this.swapping) {
            this.setAnimation(1, 'swap', false);
        } else if (this.touchDown) {
            this.setAnimation(1, 'touch_down', true);
        } else if (this.active) {
            this.setAnimation(1, 'active', true);
        } else {
            this.setAnimation(1, 'default_idle', true);
        }
    }

    render() {
        const {w, h, size, interactive, container, sheets} = this.options;
        const {letter, type} = this;

        const tile = this.tile = new Spine(sheets.spineTiles.spineData);
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        const {width, height, x, y} = tile.spineData;
        tile.x = (w * 165) + (165/2);
        tile.y = (h * 165) + (165/2);
        tile.interactive = true;
        tile.cursor = "pointer";

        tile.on("pointerdown", () => this.setTouchDown());

        tile.on("pointerup", () => this.setTouchUp());

        tile.on('pointertap', () => {
            this.handleTap();
        });

        this.setLetter(letter, type);

        container.addChild(tile);
    }
}