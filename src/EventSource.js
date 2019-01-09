// @flow

const mergeWith = require('lodash/mergeWith');
const last = require('lodash/last');
const isObject = require('lodash/isObject');

import type { Event } from './Event'; 
import type { DB, DBEvent } from './database/DB';

class EventSource {
    db: DB;
    aggregate: {};

    constructor(db: DB, aggregate: {} = {}) {
        this.db = db;
        this.aggregate = aggregate;
    }

    onEvent = (evt: Event, isSnapshot: boolean = false) => {
        return this.db.insertEvent(evt, isSnapshot);
    }

    customizer = (objValue: {}, srcValue: {}, key: string) => {
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
            const obj = mergeWith(objValue, srcValue, this.customizer);
            return obj;
        }
        return objValue;
    }

    reducer = (acc: {}, cur: {}) => {
        const obj = mergeWith({}, cur, acc, this.customizer.bind(this));
        return obj;
    }

    getState = (context: string, createSnapshot: boolean = true) => {
        return this.db.getSnapshot(context).then((snapshot: DBEvent) => {
            return this.db
                .getEvents(context, snapshot.seq)
                .then((events: Array<DBEvent>) => {
                    if (snapshot.seq) {
                        return events.filter(e => e.seq > snapshot.seq || e.isSnapshot);
                    }
                    return events;
                })
                .then((events: Array<DBEvent>) => {
                    if (!events || events.length === 0) {
                        return snapshot.data;
                    }
                    const state = events.reduce(this.reducer, {});

                    state.seq = last(events).seq;

                    if (createSnapshot) {
                        // create a snapshot every time for increased efficiency
                        this.snapshot(state.data);
                    }

                    return state.data;
                });
        });
    }

    snapshot = (state: Event) => {
        this.onEvent(state, true);
    }
}

module.exports = EventSource;
