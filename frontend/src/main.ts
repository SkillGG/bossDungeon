import { GameSettings } from "./UI";
import { FpsCounter } from "./components/FpsCounter/fpsCounter";
import { GameMenu } from "./components/Menu/menu";
import { SpriteLoader } from "./components/Primitives/Sprite/SpriteLoader";
import { Game } from "./game";
import "./style.css";

export enum GameState {
    MENU = "menu",
}

SpriteLoader.loadAllSprites().then(() => {
    const gameBox = document.querySelector("#board_container");

    const ui = new GameSettings<GameState>();

    if (!gameBox) throw new Error("Could not find the boxes!");

    const game = (window.game = new Game<GameState>(GameState.MENU));

    gameBox.append(game);

    ui.createManager(game.manager);

    /**
     * Register all GameStates
     */
    game.manager.registerGameState(...Object.values(GameState));

    /**
     * Add objects
     */
    const fpsCounter = new FpsCounter([10, 15], Game.VERSION);
    game.manager.addObject(fpsCounter, "any");

    const menuManager = new GameMenu(game.manager);
    game.manager.addStateManager(new GameMenu(game.manager));
    menuManager.registerObjects();

    game.manager.addStateManager(GameSettings.manager);
    GameSettings.manager.registerObjects();

    /**
     * Game loop
     */

    const targetFPS = Game.desiredFPS;
    const fpsInterval: number = 1000 / targetFPS;
    let previous: number;

    async function loop() {
        const curtime = performance.now();
        const timeDelta = curtime - previous;
        if (timeDelta > fpsInterval) {
            fpsCounter.curTime = curtime;
            previous = curtime - (timeDelta % fpsInterval);
            await game.update(timeDelta);
            await game.render();
        }
        requestAnimationFrame(loop);
    }

    game.run();

    previous = performance.now();
    loop();
});
