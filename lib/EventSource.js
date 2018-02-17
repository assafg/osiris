const _ = require('lodash');
const MAX_EVENTS = 1000;

class EventSource {
    constructor(db, aggregate = {}) {
        this.db = db;
        this.aggregate = aggregate;
    }

    onEvent(evt) {
        this.db.insertEvent(evt, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    customizer(objValue, srcValue, key) {
        if (this.aggregate[key] && _.isNumber(objValue)) {
            return objValue + srcValue;
        }
        return objValue;
    }

    getState(context) {
        return this.db
            .getSnapshot(context)
            .then(snapshot => snapshot)
            .then(snapshot => {
                return this.db
                    .getEvents(context, snapshot.timestamp)
                    .then(events => {
                        if (snapshot.timestamp) {
                            return events.filter(e => e.timestamp > snapshot.timestamp || e.isSnapshot);
                        }
                        return events;
                    })
                    .then(events => {
                        const state = events.reduce((acc, cur) => {
                            const obj = _.mergeWith(cur, acc, this.customizer.bind(this));
                            return obj;
                        }, snapshot);
                        state.timestamp = _.last(events).timestamp;
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
