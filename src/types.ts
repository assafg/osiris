export interface DB {
    replaceSnapshot(context: Context, state: Event): Promise<void>;
    insertEvent(evt: any): Promise<Event>;
    getEvents(context: Context, seq?: number): Promise<Event[]>;
    getSnapshot(context: Context): Promise<Event> | null;
}

export interface Event {
    _id?: string;
    seq?: number;
    isSnapshot?: boolean;
    [key: string]: any;
}

export type Context = {
    name: string;
    value: string | number;
}
