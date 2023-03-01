import * as PIXI from "pixi.js";
import {Spine, SpineDebugRenderer} from 'pixi-spine';
import {Skin} from '@pixi-spine/runtime-3.8';

import PackedTrie from "./ptrie";
import PackedDict from "./dict";
import Tile from "./tile";
import {letterData} from "./config";
import { CastWord, LevelType } from "./types";

type Options = {
    root: PIXI.Container,
    x: number,
    y: number,
    width: number,
    height: number,
    level: LevelType,
    container: PIXI.Container,
    sheets: any,
    onCastSpell: (words: Array<CastWord>) => void,
}
export default class SpellBook {
    options: Options;
    container: PIXI.Container;
    activeTile: Tile | null;
    foundWords: Array<CastWord>;
    dict: PackedTrie;
    tiles: Array<Array<Tile>>;
    _possibleLetters: Array<string> | undefined;
    button: Spine;

    constructor(options: Options) {
        this.options = options;
        this._possibleLetters = undefined;

        const {x, y, width, height, root, container, sheets, level: {gridWidth, gridHeight}} = this.options;
        const spacing = 0;

        const tileSize = width <= height ?
            Math.round((width - (spacing * (gridWidth - 1))) / gridWidth) :
            Math.round((height - (spacing * (gridHeight - 1))) / gridHeight);

        const xOffset = Math.round((width - ((tileSize * gridWidth) + (spacing * (gridWidth - 1)))) / 2);
        const yOffset = Math.round((height - ((tileSize * gridHeight) + (spacing * (gridHeight - 1)))) / 2);

        const spellbookContainer = this.container = new PIXI.Container();
        container.addChild(spellbookContainer);
        spellbookContainer.x = x;
        spellbookContainer.y = y;

        this.activeTile = null;
        this.foundWords = [];

        this.dict = new PackedTrie(PackedDict);

        const tiles: Array<Array<Tile>> = this.tiles = [];
        let pos = 0;

        const tileContainer = new PIXI.Container();
        tileContainer.x = xOffset;
        tileContainer.y = yOffset;
        tileContainer.scale.x = width / (165 * gridWidth);
        tileContainer.scale.y = width / (165 * gridWidth);
        spellbookContainer.addChild(tileContainer);

        for (let h = 0; h < gridHeight; h += 1) {
            tiles[h] = [];
            for (let w = 0; w < gridWidth; w += 1) {
                const [letter, type] = this.getNewLetter();
                tiles[h][w] = new Tile({
                    root,
                    pos,
                    container: tileContainer,
                    sheets,
                    letter,
                    type,
                    w,
                    h,
                    onActivate: () => this.handleActivate(tiles[h][w]),
                });

                pos += 1;
            }
        }

        this.button = new Spine(sheets.buttonCast.spineData);
    }

    getNewLetter() {
        const possibleLetters = this.getLetterData();
        const letter = possibleLetters[Math.floor(Math.random() * possibleLetters.length)].toUpperCase();
        const type = ["default", "blue"][Math.floor(Math.random() * 1.1)];
        return [letter, type];
    }

    getLetterData() {
        if (this._possibleLetters) {
            return this._possibleLetters;
        }

        const possibleLetters = [];

        for (var letter of Object.keys(letterData.letters)) {
            // @ts-ignore
            var num = letterData.letters[letter];

            // We do this to make it easier to grab a random letter from a list
            for (var j = 0; j < num; j++) {
                possibleLetters.push(letter);
            }

            // Calculate the points for all the letters
            //letterPoints[letter] = Math.round((letterData.total / num) / 8.5);
        }

        this._possibleLetters = possibleLetters;
        return this._possibleLetters;
    }

    handleActivate(tile: Tile) {
        if (this.activeTile) {
            if (this.activeTile === tile) {
                tile.setInactive();
            } else {
                this.swapTiles(this.activeTile, tile);
            }
            this.activeTile = null;
        } else {
            this.activeTile = tile;
            tile.setActive();
        }
    }

    swapTiles(tileA: Tile, tileB: Tile) {
        const {w: aW, h: aH} = this.getTileWH(tileA);
        const {w: bW, h: bH} = this.getTileWH(tileB);
        const aPos = tileA.pos;
        const bPos = tileB.pos;
        const aLetter = tileA.letter;
        const bLetter = tileB.letter;
        const aType = tileA.type;
        const bType = tileB.type;

        tileA.swap(bLetter, bType);
        tileB.swap(aLetter, aType);

        tileA.pos = bPos;
        tileB.pos = aPos;

        setTimeout(() => {
            this.findWords();
        }, 600);
    }

    resetFoundWords() {
        const {level: {gridHeight, gridWidth}} = this.options;

        for (let h = 0; h < gridHeight; h += 1) {
            for (let w = 0; w < gridWidth; w += 1) {
                this.tiles[h][w].setIsNotPartOfHorizontalWord();
                this.tiles[h][w].setIsNotPartOfVerticalWord();
            }
        }

        this.foundWords = [];
    }

    findWords() {
        const {level: {gridHeight, gridWidth, verticalWords, horizontalWords, minWordSize}} = this.options;
        const {tiles, dict} = this;

        const numExistingWords = this.foundWords.length;

        this.resetFoundWords();

        // Find words in each column
        if (verticalWords) {
            for (let w = 0; w < gridWidth; w += 1) {
                for (let h = 0; h <= gridHeight - minWordSize; h += 1) {
                    for (let size = gridHeight; size >= minWordSize; size -= 1) {
                        if (h + size > gridHeight) {
                            continue;
                        }

                        let word = "";
                        let alreadyPartOfWord = false;

                        for (let lh = h; lh < h + size; lh += 1) {
                            if (tiles[lh][w].isPartOfVerticalWord) {
                                alreadyPartOfWord = true;
                                break;
                            }
                            word += tiles[lh][w].letter;
                        }

                        if (alreadyPartOfWord) {
                            continue;
                        }

                        if (dict.isWord(word.toLowerCase())) {
                            this.foundWords.push({
                                word,
                                length: word.length,
                                dir: "vertical",
                                color: "default",
                                x: w,
                                y: h,
                            });
                            let castType = "default";
                            for (let lh = h; lh < h + size; lh += 1) {
                                if (tiles[lh][w].type !== "default") {
                                    castType = tiles[lh][w].type;
                                }
                            }
                            for (let lh = h; lh < h + size; lh += 1) {
                                tiles[lh][w].setIsPartOfVerticalWord(lh - h + 1, castType);
                            }
                        }
                    }
                }
            }
        }

        // Find words in each row
        if (horizontalWords) {
            for (let h = 0; h < gridHeight; h += 1) {
                for (let w = 0; w <= gridWidth - minWordSize; w += 1) {
                    for (let size = gridWidth; size >= minWordSize; size -= 1) {
                        if (w + size > gridWidth) {
                            continue;
                        }

                        let word = "";
                        let alreadyPartOfWord = false;

                        for (let lw = w; lw < w + size; lw += 1) {
                            if (tiles[h][lw].isPartOfHorizontalWord) {
                                alreadyPartOfWord = true;
                                break;
                            }
                            word += tiles[h][lw].letter;
                        }

                        if (alreadyPartOfWord) {
                            continue;
                        }

                        if (dict.isWord(word.toLowerCase())) {
                            this.foundWords.push({
                                word,
                                length: word.length,
                                dir: "horizontal",
                                color: "default",
                                x: w,
                                y: h,
                            });
                            let castType = "default";
                            for (let lw = w; lw < w + size; lw += 1) {
                                if (tiles[h][lw].type !== "default") {
                                    castType = tiles[h][lw].type;
                                }
                            }
                            for (let lw = w; lw < w + size; lw += 1) {
                                tiles[h][lw].setIsPartOfHorizontalWord(lw - w + 1, castType);
                            }
                        }
                    }
                }
            }
        }

        // @ts-ignore getCurrent exists!
        const curIntAnimation = this.button.state.getCurrent(0)?.animation?.name;

        if (this.foundWords.length > 0) {
            if (curIntAnimation !== "button_cast_ready" && curIntAnimation !== "button_cast_idle_to_ready") {
                if (curIntAnimation === "button_pass_ready" || curIntAnimation === "button_pass_activate") {
                    this.button.state.setAnimation(0, 'button_pass_to_cast', false);
                } else {
                    this.button.state.setAnimation(0, 'button_cast_idle_to_ready', false);
                }
                this.button.state.addAnimation(0, 'button_cast_ready', true, 0);
            }
            //this.button.interactive = true;
            //this.button.cursor = "pointer";
        } else if (this.foundWords.length === 0) {
            if (curIntAnimation === "button_cast_ready" || curIntAnimation === "button_cast_idle_to_ready" || curIntAnimation === "button_cast_activate") {
                this.button.state.setAnimation(0, 'button_cast_to_pass', false);
                this.button.state.addAnimation(0, 'button_pass_ready', true, 0);
            } else {
                this.button.state.setAnimation(0, 'button_pass_ready', true);
            }
            //this.button.interactive = false;
            //this.button.cursor = "default";
        }
    }

    getTileWH(tile: Tile) {
        return {
            w: tile.pos % this.options.level.gridWidth,
            h: Math.floor(tile.pos / this.options.level.gridHeight),
        };
    }

    handleCastSpell() {
        this.button.state.setAnimation(0, 'button_cast_activate', false);
        //this.button.state.addAnimation(0, 'button_cast_ready', true);
        //this.button.interactive = false;
        //this.button.cursor = "default";

        this.options.onCastSpell(this.foundWords);
        let offset = 0;
        const stagger = 64;

        for (const word of this.foundWords) {
            if (word.dir === "horizontal") {
                for (let w = word.x; w < word.x + word.length; w += 1) {
                    setTimeout(() => {
                        const [letter, type] = this.getNewLetter();
                        this.tiles[word.y][w].cast(letter, type);
                    }, stagger * (offset++));
                    setTimeout(() => {
                        this.tiles[word.y][w].spawn();
                    }, 2000 + (stagger * word.length));
                }
            } else {
                for (let h = word.y; h < word.y + word.length; h += 1) {
                    const [letter, type] = this.getNewLetter();
                    this.tiles[h][word.x].cast(letter, type);
                }
            }
            setTimeout(() => {
                this.findWords();
            }, 2000 + (stagger * offset));
        }
    }

    handlePass() {
        const {level: {gridHeight, gridWidth}} = this.options;

        this.button.state.setAnimation(0, 'button_pass_activate', false);

        this.options.onCastSpell([]);

        for (let h = 0; h < gridHeight; h += 1) {
            for (let w = 0; w < gridWidth; w += 1) {
                const [letter, type] = this.getNewLetter();
                this.tiles[h][w].swap(letter, type);
            }
        }

        setTimeout(() => {
            this.findWords();
        }, 1000);
    }

    render() {
        const {container} = this;
        const {level: {gridHeight, gridWidth}, width, height, x, y, sheets} = this.options;


        for (let h = 0; h < gridHeight; h += 1) {
            for (let w = 0; w < gridWidth; w += 1) {
                this.tiles[h][w].render();
            }
        }

        const button = this.button;
        //tile.debug = new SpineDebugRenderer();
        //tile.debug.drawDebug = true;

        button.scale.x = 0.4;
        button.scale.y = 0.4;
        button.x = (width / 2);
        button.y = height - 50;

        button.skeleton.setSkinByName('default');
        button.skeleton.setSlotsToSetupPose();
        button.state.setAnimation(0, 'button_pass_ready', true);

        button.interactive = true;
        button.cursor = "pointer";

        button.on("pointertap", () => {
            if (this.foundWords.length > 0) {
                this.handleCastSpell();
            } else {
                this.handlePass();
            }
        });

        container.addChild(button);

        /*
        const pass = this.pass = new Spine(sheets.buttonCast.spineData);
        //pass.debug = new SpineDebugRenderer();
        //pass.debug.drawDebug = true;
        //const {width: spineWidth, height: spineHeight, x: spineX, y: spineY} = pass.spineData;

        pass.scale.x = 0.3;
        pass.scale.y = 0.3;
        pass.x = width / 4;
        pass.y = height - 50;

        pass.skeleton.setSkinByName('default');
        pass.skeleton.setSlotsToSetupPose();
        pass.state.setAnimation(0, 'button_pass_idle', true);

        pass.on("pointertap", () => this.handlePass());

        container.addChild(pass);
        */

        this.findWords();
    }
}