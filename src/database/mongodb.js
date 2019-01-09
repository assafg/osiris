// @flow

const mongojs = require('mongojs');
const { v1 } = require('uuid');
import type { DB, DBEvent } from './DB';
import type { Event } from '../Event';

class MongoDB implements DB {
    collection: any;

    constructor({ dbpath, collection }) {
        this.db = mongojs(dbpath, [collection]);
        this.collection = this.db.collection(collection);
        this.collection.createIndex({
            seq: -1,
            context: 1,
            snapshot: 1,
        });
    }

    insertEvent(evt: Event) {
        const decorated = Object.assign(
            {},
            {
                _id: v1(),
                seq: Date.now(),
            },
            evt
        );
        return new Promise((resolve, reject) => {
            this.collection.insert(decorated, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

    getEvents(context: string, seq: number = 0): Promise<[DBEvent]>{
        return new Promise((resolve, reject) => {
            const query = { 
                context,
                seq: {},
             };
            if (seq) {
                query.seq = {
                    $gte: seq,
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

    getSnapshot(context: string): Promise<?DBEvent> {
        return new Promise((resolve, reject) => {
            this.collection.find({ context, isSnapshot: true }).limit(1, (err, snapshot) => {
                if (err) {
                    return reject(err);
                }
                return resolve(snapshot.length > 0 ? 
                    { data: snapshot[0], isSnapshot: true, seq: snapshot[0].seq  } 
                    : 
                    null);
            });
        });
    }
}

module.exports = MongoDB;
