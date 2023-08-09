import {  Cards, DungeonCard } from "../../shared/Cards/card";
import { GameSettings } from "./UI";
import { FpsCounter } from "./components/FpsCounter/fpsCounter";
import { RectangleBounds } from "./components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "./components/Primitives/Rectangle/RotatedRectangleBounds";
import { SpriteLoader } from "./components/Primitives/Sprite/SpriteLoader";
import { Game } from "./game";
import { GameMenu } from "./game/Menu/menu";
import { DungeonGameCard } from "./game/Room/GameCards/dungeonGameCard";
import { RoomBoard } from "./game/Room/board";
import { RoomLobby } from "./game/Room/lobby";
import { Room } from "./game/Room/room";
import "./style.css";

export enum GameState {
    MENU = "menu",
    GAME_LOBBY = "lobby",
    GAME_BOARD = "gameboard",
}
const room = new Room();

declare global {
    interface Window {
        room: Room;
    }
}

window.room = room;

export const theme = {
    textColor: "white",
    bgColor: "#1c1c1c",
} as const;

SpriteLoader.loadAllSprites().then(() => {
    const gameBox = document.querySelector("#board_container");

    if (!gameBox) throw new Error("Could not find the boxes!");

    const settings = new GameSettings<GameState>();

    const game = (window.game = new Game<GameState>(GameState.MENU));

    gameBox.append(game);

    settings.createManager(game.manager);

    /**
     * Register all GameStates
     */
    game.manager.registerGameState(...Object.values(GameState));

    /**
     * Add objects
     */
    const fpsCounter = new FpsCounter([10, 15], Game.VERSION);
    game.manager.addObject(fpsCounter, "any");

    const menuManager = new GameMenu(game.manager, room);
    game.manager.addStateManager(menuManager);
    menuManager.registerObjects();

    const gameRoom = new RoomLobby(game.manager, room);
    game.manager.addStateManager(gameRoom);
    gameRoom.registerObjects();

    const gameBoard = new RoomBoard(game.manager, room);
    game.manager.addStateManager(gameBoard);

    game.manager.addStateManager(GameSettings.manager);
    GameSettings.manager.registerObjects();

    const bC = new DungeonGameCard(
        new DungeonCard(Cards.dungCards[1], "dC", {}),
        RotatedRectangleBounds.fromRectangleBounds(
            new RectangleBounds(200, 200, 100, 200)
        ),
        9
    );

    game.manager.addObject(bC, GameState.MENU);

    bC.update = async () => {
        if (Game.input.isPointerInTriangles(bC.bounds.triangles)) {
            bC.angle += 4;
            bC.radAngle;
        }
    };

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
