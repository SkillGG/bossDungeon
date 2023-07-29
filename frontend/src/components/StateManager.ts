import { Updateable } from "../utils/utils";
import { GameObject } from "./GameObject";
import { ObjectManager } from "./ObjectManager";

type State<T> = "any" | T;

export abstract class StateManager<T extends string> implements Updateable {
    currentState: T | null = null;
    objects: GameObject[] = [];
    abstract get defaultID(): string;
    constructor(
        public id: string,
        public manager: ObjectManager<T>,
        public state: State<T>
    ) {}
    add(...o: GameObject[]) {
        this.objects.push(...o);
    }
    registerObject(...obs: GameObject[]) {
        for (const o of obs) this.manager.addObject(o, this.state);
    }
    removeObject(...obs: GameObject[]) {
        for (const o of obs) this.manager.removeObject(o.id, this.state);
    }
    abstract update(t: number): Promise<void>;
    removeObjects(): void {
        this.removeObject(...this.objects);
    }
    registerObjects(): void {
        this.registerObject(...this.objects);
    }
}
