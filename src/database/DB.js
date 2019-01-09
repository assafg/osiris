// @flow
import type { Event } from '../Event'; 

export type DBEvent = {
    seq: number,
    isSnapshot: ?boolean,
    data: Array<Event>
}

export interface DB {
    insertEvent(evt: Event, isSnapshot: ?boolean): void,
    initTable(): void,
    getEvents(context: string, id: number): Promise<Array<DBEvent>>,
    getSnapshot(context: string): Promise<DBEvent>,
}
