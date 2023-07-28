import { ObjectManager } from "./components/ObjectManager";
import { StateManager } from "./components/StateManager";
import { GameState } from "./main";
import { mUI_Z } from "./utils/zLayers";

declare global {
    interface Window {
        options: GameSettings<GameState>;
    }
}

export class UIManager<T extends string> extends StateManager<T> {
    static DefaultID = "options";
    get defaultID() {
        return UIManager.DefaultID;
    }

    areRegistered = false;
    parent: GameSettings<T>;

    constructor(
        manager: ObjectManager<T>,
        parent: GameSettings<T>,
        zIndex = mUI_Z
    ) {
        super(UIManager.DefaultID, manager, "any");
        this.parent = parent;
        zIndex;
    }

    refreshUI() {
        if (!this.currentState) return;
    }
    removeObjects(): void {
        if (!this.areRegistered) return;
        this.areRegistered = false;
    }
    registerObjects(): void {
        if (this.areRegistered) return;
        this.areRegistered = true;
    }
    async update() {
        this.refreshUI();
    }
}

export class GameSettings<T extends string> {
    static #instance: GameSettings<any> | null = null;

    static get instance() {
        if (!GameSettings.#instance)
            throw new Error("Game Settings not created yet!");
        return GameSettings.#instance as GameSettings<any>;
    }

    get manager() {
        if (!this.stateManager) throw new Error("UI Manager not created yet");
        return this.stateManager;
    }

    stateManager: UIManager<T> | null = null;

    static get manager() {
        if (!GameSettings.#instance)
            throw new Error("UI Instance not created yet!");
        if (!GameSettings.#instance.stateManager)
            throw new Error("UI State manager not created yet!");
        return GameSettings.#instance.stateManager;
    }

    constructor() {
        GameSettings.#instance = this;
    }

    createManager(manager: ObjectManager<T>) {
        this.stateManager = new UIManager(manager, this);
    }
}
