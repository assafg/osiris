// @flow
import mergeWith from 'lodash/mergeWith';
import last from 'lodash/last';
import isObject from 'lodash/isObject';
import { DB } from './database/Interface';

class EventSource {
    db: DB;
    aggregate: Object;
    customizer: Function;
    reducer: Function;

    constructor(db: DB, aggregate: Object = {}) {
        this.db = db;
        this.aggregate = aggregate;
        this.reducer = this.reducer.bind(this);
        this.customizer = this.customizer.bind(this);
    }

    onEvent(evt: Object) {
        return this.db.insertEvent(evt.context, evt);
    }

    customizer(objValue: any, srcValue: any, key: string) {
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
            const obj = mergeWith(objValue, srcValue, this.customizer);
            return obj;
        }
        return objValue;
    }

    reducer(acc: any, cur: Object) {
        const obj = mergeWith({}, cur, acc, this.customizer.bind(this));
        return obj;
    }

    getState(context: string, createSnapshot: boolean = true) {
        return this.db.getSnapshot(context).then(snapshot => {
            return this.db
                .getEvents(context, snapshot.seq)
                .then(events => {
                    if (snapshot.seq) {
                        return events.filter(
                            e => e.seq > snapshot.seq || e.isSnapshot
                        );
                    }
                    return events;
                })
                .then(events => {
                    if (!events || events.length === 0) {
                        return snapshot;
                    }
                    const state = events.reduce(this.reducer, {});

                    if (createSnapshot && state) {
                        state.seq = last(events).seq;
                        // create a snapshot every time for increased efficiency
                        this.snapshot(state);
                    }

                    // clean the state object
                    delete state.isSnapshot;
                    delete state.seq;
                    return state;
                });
        });
    }

    snapshot(state: Object) {
        if (!state) {
            // Creates a state and then recourses back here
            return this.getState(state.context);
        }
        return this.db.insertEvent(state.context, state);
    }
}

module.exports = EventSource;
