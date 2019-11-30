import { mergeWith, last, isObject } from 'lodash';
import { DB, Event } from './types';

export class EventSource {
    db: DB;
    aggregate: any;

    constructor(db: DB, aggregate: object = {}) {
        this.db = db;
        this.aggregate = aggregate;
    }

    onEvent(evt: Event) {
        return this.db.insertEvent(evt.context, evt);
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
            const obj: Event = mergeWith(
                objValue,
                srcValue,
                this.customizer
            ) as Event;
            return obj;
        }
        return objValue;
    };

    reducer = (acc: object, cur: Event): any => {
        const obj = mergeWith({}, cur, acc, this.customizer);
        return obj;
    };

    getState = async (context: string, createSnapshot: boolean = true) => {
        const snapshot = await this.db.getSnapshot(context);
        let events = await this.db.getEvents(
            context,
            snapshot ? snapshot.seq : 0
        );

        // Find only events after the snapshot
        if (snapshot && snapshot.seq) {
            events = events.filter(e => e.seq > snapshot.seq || e.isSnapshot);
        }

        // No new events beyond the snapshot
        if (!events || events.length === 0) {
            return snapshot;
        }

        const state: Event = events.reduce(this.reducer, {});
        console.log(events);
        if (createSnapshot && state) {
            state.isSnapshot = true;

            // create a snapshot every time for increased efficiency
            this.snapshot(state);
        }

        // clean the state object
        delete state.isSnapshot;
        delete state.seq;
        return state;

        // return .then(snapshot => {
        //     return
        //         .then((events: Event[]) => {
        //             if (snapshot && snapshot.seq) {
        //                 return events.filter(
        //                     e => e.seq > snapshot.seq || e.isSnapshot
        //                 );
        //             }
        //             return events;
        //         })
        //         .then((events: Event[]) => {
        //             if (!events || events.length === 0) {
        //                 return snapshot;
        //             }
        //             const state: Event = events.reduce(this.reducer, {});

        //             if (createSnapshot && state) {
        //                 state.seq = last<any>(events).seq;
        //                 // create a snapshot every time for increased efficiency
        //                 this.snapshot(state);
        //             }

        //             // clean the state object
        //             delete state.isSnapshot;
        //             delete state.seq;
        //             return state;
        //         });
        // });
    };

    snapshot(state: Event): Promise<Event> {
        if (!state) {
            // Creates a state and then recourses back here
            return this.getState(state.context);
        }
        return this.db.insertEvent(state.context, state);
    }
}

export default { EventSource };
