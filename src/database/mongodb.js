// @flow
import { DB } from './Interface';
import mongojs from 'mongojs';
import { v1 } from 'uuid';

class MongoDB implements DB {
    db: Object;
    collection: Object;

    constructor({ dbpath, collection }: Object) {
        this.db = mongojs(dbpath, [collection]);
        this.collection = this.db.collection(collection);
        this.collection.createIndex({
            seq: -1,
            context: 1,
            snapshot: 1,
        });
    }

    insertEvent(context: string, evt: Object): Promise<Object> {
        const decorated = Object.assign(
            {},
            {
                _id: v1(),
                seq: Date.now(),
                context,
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

    getEvents(context: string, seq: number = 0): Promise<[Object]> {
        return new Promise((resolve, reject) => {
            const query: any = { context };
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

    getSnapshot(context: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            this.collection
                .find({ context, isSnapshot: true })
                .limit(1, (err, snapshot) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(snapshot.length > 0 ? snapshot[0] : {});
                });
        });
    }
}

module.exports = MongoDB;
