type Listener<T extends any[]> = (...args: T) => void;

export class EventEmitter<EventMap extends Record<string, any[]>> {
    private listeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } =
        {};
    protected prefix: string | null = null;
    on<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        listeners.add(listener);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding on ${id} to ${this.prefix}`);
    }
    once<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        const wrapper = (...data: EventMap[T]) => {
            listeners.delete(wrapper);
            listener(...data);
        };
        listeners.add(wrapper);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding once ${id} in ${this.prefix}`);
    }
    emit<T extends keyof EventMap & string>(id: T, ...data: EventMap[T]) {
        const listeners = this.listeners[id] ?? new Set();
        for (const list of listeners) {
            list(...data);
        }
        if (this.prefix)
            console.log(`got emitted ${id} in ${this.prefix} with ${data}`);
    }
    removeAllEventListeners() {
        this.listeners = {};
    }
    static emitToAll<T extends Record<string, any[]>>(
        arr: EventEmitter<T>[],
        except: (ev: EventEmitter<T>) => boolean = () => true
    ) {
        return <K extends keyof T & string>(id: K, ...data: T[K]) => {
            arr.filter((e) => except(e)).forEach((em) => {
                em.emit(id, ...data);
            });
        };
    }
}

export class UserSSEConnection<
    T extends Record<string, any[]>
> extends EventEmitter<T> {
    userid: string;
    private closed = false;
    constructor(id: string) {
        super();
        this.userid = id;
        this.prefix = id;
    }
    get isClosed() {
        return this.closed;
    }
    close() {
        this.closed = true;
    }
    static emitToAll<T extends Record<string, any[]>>(
        arr: UserSSEConnection<T>[],
        except: (ev: UserSSEConnection<T>) => boolean = () => true
    ) {
        return <K extends keyof T & string>(id: K, ...data: T[K]) => {
            arr.filter((e) => except(e)).forEach((em) => {
                em.emit(id, ...data);
            });
        };
    }
}
