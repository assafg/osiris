import { mergeWith, isObject } from 'lodash';
import { DB, Event, Context } from './types';

export class EventSource {
    db: DB;
    aggregate: any;

    constructor(db: DB, aggregate: object = {}) {
        this.db = db;
        this.aggregate = aggregate;
    }

    onEvent(evt: Event) {
        return this.db.insertEvent(evt);
    }

    customizer = (objValue: any, srcValue: any, key: string): any | null => {
        if (this.aggregate[key]) {
            return Number(objValue || 0) + Number(srcValue || 0);
        }

        // Delete existing value
        if (objValue === null) {
            return null;
        }
        if (objValue === null || objValue === undefined) {
            return srcValue;
        }
        if (isObject(objValue) && isObject(srcValue)) {
            // const obj = mergeWith(objValue, srcValue, this.customizer);
            const obj: Event = mergeWith(objValue, srcValue, this.customizer) as Event;
            return obj;
        }
        return objValue;
    };

    reducer = (acc: object, cur: Event): any => {
        const obj = mergeWith({}, cur, acc, this.customizer);
        return obj;
    };

    getState = async (context: Context) => {
        const snapshot = await this.db.getSnapshot(context);
        
        let events = await this.db.getEvents(context, snapshot ? snapshot.seq : 0);

        // Find only events after the snapshot
        if (snapshot && snapshot.seq) {
            events = events.filter(e => e.seq > snapshot.seq || e.isSnapshot);
        }

        // No new events beyond the snapshot
        if (!events || events.length === 0) {
            return snapshot;
        }

        const state: Event = events.reduce(this.reducer, {});
        
        // async
        
        await this.snapshot(context, state);
        
        // clean the state object
        delete state.isSnapshot;
        delete state.seq;
        return state;
    };

    private snapshot(context:Context, state?: Event): Promise<void> {
        // setImmediate(() => {
            return this.db.replaceSnapshot(context, state);
        // })
    }
}

export default { EventSource };
