import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-4.1';

type Options = {
    w: number,
    h: number,
    pos: number,
    letter: string,
    type: string,
    onActivate: () => void,
    sheets: any,
    root: PIXI.Container,
    container: PIXI.Container,
}

export default class Tile {
    options: Options;
    active: boolean;
    isPartOfHorizontalWord: boolean;
    isPartOfVerticalWord: boolean;
    pos: number;
    letter: string;
    type: string;
    castType: string;
    touchDown: boolean;
    swapping: boolean;
    casting: boolean;
    spawning: boolean;
    posInWord: number;
    tileContainer: PIXI.Container;
    tile: Spine;

    constructor(options: Options) {
        this.options = options;

        this.active = false;
        this.isPartOfHorizontalWord = false;
        this.isPartOfVerticalWord = false;
        this.pos = this.options.pos;
        this.letter = this.options.letter;
        this.type = this.options.type;
        this.castType = this.options.type;
        this.touchDown = false;
        this.swapping = false;
        this.casting = false;
        this.spawning = false;
        this.posInWord = 0;

        this.tileContainer = new PIXI.Container();
        this.tile = new Spine(this.options.sheets.spineTiles.spineData);
        this.tileContainer.addChild(this.tile);
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
        this.posInWord = 0;
        this.castType = this.type;
        if (!this.swapping) {
            this.updateHighlight();
        }
    }

    setIsPartOfVerticalWord(pos: number, castType: string) {
        this.isPartOfVerticalWord = true;
        this.posInWord = pos;
        this.castType = castType;
        if (!this.swapping) {
            this.updateHighlight();
        }
        this.updateSkin();
    }

    setIsNotPartOfHorizontalWord() {
        this.isPartOfHorizontalWord = false;
        this.posInWord = 0;
        this.castType = this.type;
        if (!this.swapping) {
            this.updateHighlight();
        }
    }

    setIsPartOfHorizontalWord(pos: number, castType: string) {
        this.isPartOfHorizontalWord = true;
        this.posInWord = pos;
        this.castType = castType;
        if (!this.swapping) {
            this.updateHighlight();
        }
        this.updateSkin();
    }

    swap(letter: string, type: string) {
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

    cast(newLetter: string, type: string) {
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

    setLetter(letter: string, type: string) {
        this.letter = letter;
        this.type = type;
        this.castType = type;
        this.updateSkin();
    }

    updateSkin() {
        const {tile, type, castType, letter} = this;
        const newSkin = new Skin("combined-skin");
        this.addSkin(newSkin, `tile_magic/tile_magic_${this.castType}`)
        this.addSkin(newSkin, `colors/color_${this.type}`);
        this.addSkin(newSkin, `letters/letter_${letter.toLowerCase()}`);
        // @ts-ignore setSkin exists
        tile.skeleton.setSkin(newSkin);
        tile.skeleton.setSlotsToSetupPose();
    }

    addSkin(skin: Skin, skinName: string) {
        const {tile} = this;
        const foundSkin = tile.spineData.findSkin(skinName);
        if (foundSkin) {
            // @ts-ignore This is ok
            skin.addSkin(foundSkin);
        } else {
            console.error("Skin not found", skinName);
        }
    }

    setAnimation(track: number, name: string, repeat: boolean) {
        // @ts-ignore getCurrent exists
        const curIntAnimation = this.tile.state.getCurrent(track)?.animation?.name;

        if (curIntAnimation !== name) {
            this.tile.state.setAnimation(track, name, repeat);
        }
    }

    updateHighlight() {
        // @ts-ignore getCurrent exists
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
        const {w, h, container} = this.options;
        const {letter, type, tileContainer, tile} = this;

        tileContainer.x = (w * 165) + (165/2);
        tileContainer.y = (h * 165) + (165/2);
        tileContainer.width = 165;
        tileContainer.height = 165;
        tileContainer.interactive = true;
        tileContainer.cursor = "pointer";
        tileContainer.interactiveChildren = false;
        tileContainer.hitArea = new PIXI.Rectangle(-(165/2), -(165/2), 165, 165);

        tileContainer.on("pointerdown", () => this.setTouchDown());
        tileContainer.on("pointerup", () => this.setTouchUp());
        tileContainer.on("pointerout", () => this.setTouchUp());
        tileContainer.on('pointertap', () => {
            this.handleTap();
        });

        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;
        tile.x = 0;
        tile.y = 0;

        this.setLetter(letter, type);

        container.addChild(tileContainer);
    }
}