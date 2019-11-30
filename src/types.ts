export interface DB {
    insertEvent(contex: string, evt: any): Promise<Event>;
    getEvents(context: string, seq?: number): Promise<Event[]>;
    getSnapshot(context: string): Promise<Event>;
}

export interface Event {
    _id?: string;
    seq?: number;
    isSnapshot?: boolean;
    context: any;
}
