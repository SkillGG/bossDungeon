import { Game } from "../../game";
import { GameState } from "../../main";
import { mMENU_Z } from "../../utils/zLayers";
import { ObjectManager } from "../ObjectManager";
import { Button, ButtonOnCalls } from "../Primitives/Button/Button";
import { Label } from "../Primitives/Label/Label";
import { RectangleBounds } from "../Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../StateManager";

export class GameMenu extends StateManager<GameState> {
    static DefaultID = "menu";

    mapSize = 10;

    nameLabel: Label;
    settingsButton: Button;
    joinRoomButton: Button;

    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(manager: ObjectManager<GameState>, zIndex = mMENU_Z) {
        super(GameMenu.DefaultID, manager, GameState.MENU);
        this.nameLabel = new Label(
            "nameLabel",
            new RectangleBounds(0, 15, Game.WIDTH, 1),
            "Boss Dungeon",
            {
                border: { strokeColor: "transparent" },
                label: {
                    textColor: "black",
                    font: "2em normal Helvetica",
                },
            },
            zIndex
        );

        const buttonHover: ButtonOnCalls = {
            onenter(ev) {
                ev.target.label.border.style.fillColor = "blue";
            },
            onleave(ev) {
                ev.target.label.border.style.fillColor =
                    ev.target.label.initStyle.border?.fillColor ||
                    "transparent";
            },
        };

        this.joinRoomButton = new Button(
            `btnJoin`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 1, 180, 65),
            {
                ...buttonHover,
                onclick() {
                    const eS = new EventSource("http://localhost:3000/events");
                    eS.onopen = () => {
                        eS.onmessage = (...a) => console.log(...a);
                    };
                },
            },
            "Join",
            {
                rounded: true,
                border: {
                    radii: [90, 90, 10, 10],
                },
            },
            zIndex
        );

        this.settingsButton = new Button(
            `btnSettings`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 2, 180, 65),
            buttonHover,
            "Settings",
            {
                rounded: true,
                border: {
                    radii: [10, 10, 90, 90],
                },
            },
            zIndex
        );
        this.add(this.nameLabel, this.joinRoomButton, this.settingsButton);
    }
    removeObjects(): void {
        super.removeObjects();
    }
    registerObjects(): void {
        super.registerObjects();
    }
    async update() {}
}
