import 'pixi-spine';
import * as PIXI from "pixi.js";
import {height, width, LEVELS} from "./config.js";
import Level from "./level.js";

let app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x000000,
});
document.body.appendChild(app.view);

if (window.__PIXI_INSPECTOR_GLOBAL_HOOK__) {
    console.log("Register", PIXI)
    window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI });
}

(async function() {
    const sheets = {
        spineTiles: await PIXI.Assets.load('./assets/spine/tiles.json'),
        buttonCast: await PIXI.Assets.load('./assets/spine/button_cast.json'),
        monster: await PIXI.Assets.load('./assets/spine/goblins.json'),
        hero: await PIXI.Assets.load('./assets/spine/ss_hero.json'),
    };

    const level = new Level({
        ...LEVELS[0],
        container: app.stage,
        sheets,
        width,
        height,
    });

    level.render();
})();