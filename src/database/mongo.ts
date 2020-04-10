import { DB, Event, Context } from '../types';
import { MongoClient, Collection, Db } from 'mongodb';
import { v1 } from 'uuid';

export class MongoDB implements DB {
    db: Db;
    collection: Collection;
    sequences: Collection;

    dbpath: string;
    collectionName: string;

    constructor(dbpath: string, collectionName: string) {
        this.dbpath = dbpath;
        this.collectionName = collectionName;
    }

    async connect() {
        const client = new MongoClient(this.dbpath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        const db = await client.db();
        const collection = await db.collection(this.collectionName);
        const sequences = await db.collection('__sequences');
        collection.createIndex({
            seq: -1,
            snapshot: 1,
        });

        this.db = db;
        this.collection = collection;
        this.sequences = sequences;
    }

    async getNextSequenceValue(sequenceName: string) {
        const sequenceDocument = await this.sequences.findOneAndUpdate(
            { _id: sequenceName },
            { $inc: { sequence_value: 1 } },
            { upsert: true }
        );

        if (!sequenceDocument.value) {
            return 1;
        }

        return sequenceDocument.value.sequence_value;
    }

    insertEvent = async (evt: any) => {
        const decorated: Event = Object.assign(
            {},
            {
                _id: v1(),
                seq: evt.seq || (await this.getNextSequenceValue('es')),
            },
            evt
        ) as Event;

        return this.collection.insertOne(decorated);
    };

    getEvents = async (context: Context, seq: number = 0): Promise<Event[]> => {
        const query: any = { [context.name]: context.value };
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

    getSnapshot(context: Context): Promise<Event> {
        return this.collection.findOne({ [context.name]: context.value, isSnapshot: true });
    }
}

export default { MongoDB };
