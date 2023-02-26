import 'pixi-spine';
import * as PIXI from "pixi.js";

import {width, height, LEVELS} from "./config";
import Level from "./level";

let app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x000000,
    autoDensity: true,
});
// @ts-ignore this works fine
document.body.appendChild(app.view);

(async function() {
    const sheets = {
        spineTiles: await PIXI.Assets.load('./assets/spine/tiles.json'),
        buttonCast: await PIXI.Assets.load('./assets/spine/button_cast.json'),
        monster: await PIXI.Assets.load('./assets/spine/goblins.json'),
        hero: await PIXI.Assets.load('./assets/spine/ss_hero.json'),
    };

    const level = new Level({
        level: LEVELS[0],
        container: app.stage,
        sheets,
        width,
        height,
        health: 50,
    });

    level.render();
})();