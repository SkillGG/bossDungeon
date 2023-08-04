import { timerData, timerType } from "../shared/events";
import { UserConnection } from "./GameRoom";

export class Countdown {
    type: timerType;

    timer?: NodeJS.Timer;

    conns: UserConnection[];

    countdown: number;

    afterFinish: () => void;
    beforeFinish: () => void;
    getData: () => timerData;

    finished = true;

    constructor(
        data: timerType,
        conns: UserConnection[],
        time: number,
        finishes: { afterFinish?: () => void; beforeFinish?: () => void },
        getData: () => timerData
    ) {
        this.type = data;
        this.conns = conns;
        this.countdown = time;
        this.afterFinish = finishes.afterFinish || (() => {});
        this.beforeFinish = finishes.beforeFinish || (() => {});
        this.getData = getData;
    }

    start() {
        this.finished = false;
        UserConnection.emitToAll(this.conns)("initCountdown", {
            type: this.type,
            time: this.countdown,
        });
        this.timer = setInterval(() => {
            UserConnection.emitToAll(this.conns)("countdown", {
                type: this.type,
                time: --this.countdown,
            });

            if (this.countdown <= 0) {
                this.end(true);
            }
        }, 1000);
    }

    private end(success: boolean) {
        this.finished = true;
        clearInterval(this.timer);
        this.timer = undefined;
        console.log("The end of the timer!");
        if (success) {
            this.beforeFinish();
            UserConnection.emitToAll(this.conns)("endCountdown", {
                data: this.getData(),
                time: 0,
            });
            this.afterFinish();
        }
    }

    abort() {
        if (this.finished) return;
        this.end(false);
        UserConnection.emitToAll(this.conns)("terminateCountdown", {
            type: this.type,
            time: this.countdown,
        });
    }
}
