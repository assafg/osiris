const mergeWith = require('lodash/mergeWith');
const last = require('lodash/last');
const isObject = require('lodash/isObject');
const merge = require('lodash/merge');
const MAX_EVENTS = 1000;

class EventSource {
    constructor(db, aggregate = {}) {
        this.db = db;
        this.aggregate = aggregate;
    }

    onEvent(evt) {
        return this.db.insertEvent(evt);
    }

    customizer(objValue, srcValue, key) {
        if (this.aggregate[key]) {
            return Number(objValue || 0) + Number(srcValue || 0);
        }
        //TODO - merge objects if objValue srcValue are objects

        //Delete existing value
        if (srcValue === null) {
            return null;
        }
        if (objValue === null || objValue === undefined) {
            return srcValue;
        }
        if (isObject(objValue) && isObject(srcValue)) {
            // const obj = mergeWith(objValue, srcValue, this.customizer);
            const obj = mergeWith(objValue, srcValue, this.customizer.bind(this));
            return obj;
        }
        return srcValue;
    }

    getState(context) {
        return this.db.getSnapshot(context).then(snapshot => {
            return this.db
                .getEvents(context, snapshot.timestamp)
                .then(events => {
                    if (snapshot.timestamp) {
                        return events.filter(e => e.timestamp > snapshot.timestamp || e.isSnapshot);
                    }
                    return events;
                })
                .then(events => {
                    if (!events || events.length === 0) {
                        return {};
                    }
                    const state = events.reduce((acc, cur) => {
                        const obj = mergeWith(cur, acc, this.customizer.bind(this));
                        return obj;
                    }, {});

                    state.timestamp = last(events).timestamp;

                    // create a snapshot after a given number of events have been added
                    if (events.length > MAX_EVENTS) {
                        this.snapshot(context);
                    }
                    return state;
                });
        });
    }

    snapshot(context) {
        return new Promise(resolve => {
            this.getState(context).then(state => {
                state.isSnapshot = true;
                this.onEvent(state);
                resolve(state);
            });
        });
    }
}

module.exports = EventSource;
