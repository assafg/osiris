const mongojs = require('mongojs');
const { v1 } = require('uuid');

class MongoDB {
    constructor({ dbpath, collection }) {
        this.db = mongojs(dbpath, [collection]);
        this.collection = this.db.collection(collection);
        this.collection.createIndex({
            timestamp: -1,
            context: 1,
            snapshot: 1,
        });
    }

    insertEvent(evt, callback) {
        const decorated = Object.assign(
            {},
            {
                _id: v1(),
                timestamp: Date.now(),
            },
            evt
        );
        this.collection.insert(decorated, callback);
    }

    getEvents(context, timestamp) {
        return new Promise((resolve, reject) => {
            const query = { context };
            if (timestamp) {
                query.timestamp = {
                    $gte: timestamp,
                };
            }
            this.collection.find(query, (err, list) => {
                if (err) {
                    return reject(err);
                }
                return resolve(
                    list.map(l => {
                        delete l._id;
                        return l;
                    })
                );
            });
        });
    }

    getSnapshot(context) {
        return new Promise((resolve, reject) => {
            this.collection.find({ context, isSnapshot: true }).limit(1, (err, snapshot) => {
                if (err) {
                    return reject(err);
                }
                return resolve(snapshot.length > 0 ? snapshot[0] : {});
            });
        });
    }
}

module.exports = MongoDB;
