const mergeWith = require('lodash/mergeWith');
const last = require('lodash/last');
const isObject = require('lodash/isObject');

class EventSource {
    constructor(context, db, aggregate = {}) {
        this.context = context;
        this.db = db;
        this.aggregate = aggregate;
        this.reducer = this.reducer.bind(this);
        this.customizer = this.customizer.bind(this);
    }

    onEvent(evt) {
        return this.db.insertEvent(this.context, evt, false);
    }

    customizer(objValue, srcValue, key) {
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

    reducer(acc, cur) {
        const obj = mergeWith({}, cur, acc, this.customizer.bind(this));
        return obj;
    }

    getState(createSnapshot = true) {
        return this.db.getSnapshot(this.context).then(snapshot => {
            return this.db
                .getEvents(this.context, snapshot.seq)
                .then(events => {
                    if (snapshot.seq) {
                        return events.filter(e => e.seq > snapshot.seq || e.isSnapshot);
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

    snapshot(state) {
        if (!state) {
            // Creates a state and then recourses back here
            return this.getState(true);
        }
        return this.db.insertEvent(this.context, state, true);
    }
}

module.exports = EventSource;