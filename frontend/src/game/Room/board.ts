import { ObjectManager } from "../../components/ObjectManager";
import { StateManager } from "../../components/StateManager";
import { GameState } from "../../main";
import { Room } from "./room";

export class RoomBoard extends StateManager<GameState> {
    static readonly DefaultID = "board";
    get defaultID(): string {
        return RoomBoard.DefaultID;
    }

    room: Room;

    constructor(manager: ObjectManager<GameState>, room: Room) {
        super(RoomBoard.DefaultID, manager, GameState.GAME_BOARD);
        this.room = room;
    }
    async update(t: number): Promise<void> {
        t;
    }
}
