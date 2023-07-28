import { GameState } from "../../main";
import { mMENU_Z } from "../../utils/zLayers";
import { ObjectManager } from "../ObjectManager";
import { StateManager } from "../StateManager";

export class GameMenu extends StateManager<GameState> {
    static DefaultID = "menu";

    mapSize = 10;

    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(manager: ObjectManager<GameState>, zIndex = mMENU_Z) {
        super(GameMenu.DefaultID, manager, GameState.MENU);
        zIndex;
    }
    removeObjects(): void {}
    registerObjects(): void {}
    async update() {}
}
