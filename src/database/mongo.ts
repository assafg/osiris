import { DB, Event } from '../types';
import { MongoClient, MongoError, Collection, Db } from 'mongodb';
import { v1 } from 'uuid';

export class MongoDB implements DB {
    db: Db;
    collection: Collection;
    counters: Collection;

    static build = async (dbpath: string, collectionName: string) => {
        const client = new MongoClient(dbpath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        try {
            await client.connect();
            const db = await client.db();
            const collection = await db.collection(collectionName);
            const counters = await db.collection('counters');
            collection.createIndex({
                seq: -1,
                context: 1,
                snapshot: 1,
            });
            return new MongoDB(db, collection, counters);
        } catch (err) {
            console.log(err);
        }
    };

    private constructor(db: Db, collection: Collection, counters: Collection) {
        this.db = db;
        this.collection = collection;
        this.counters = counters;
    }

    async getNextSequenceValue(sequenceName: string) {
        var sequenceDocument = await this.counters.findOneAndUpdate(
            { _id: sequenceName },
            { $inc: { sequence_value: 1 } }
        );

        return sequenceDocument.value.sequence_value;
    }

    insertEvent = async (context: string, evt: any) => {
        const decorated: Event = Object.assign(
            {},
            {
                _id: v1(),
                seq: evt.seq || (await this.getNextSequenceValue('es')),
                context,
            },
            evt
        ) as Event;

        const res = await this.collection.insertOne(decorated);
        return decorated;
    };

    getEvents = async (context: string, seq: number = 0): Promise<Event[]> => {
        const query: any = { context };
        if (seq) {
            query.seq = {
                $gte: seq,
            };
        }
        const docs = await this.collection
            .find(query)
            .sort({ seq: 1 })
            .toArray();
        return docs.map((l: Event) => {
            delete l._id;
            return l;
        });
    };

    getSnapshot(context: string): Promise<Event> {
        return this.collection.findOne({ context, isSnapshot: true });
    }
}

export default { MongoDB };
