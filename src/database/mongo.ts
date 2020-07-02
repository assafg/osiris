import { DB, Event, Context } from '../types';
import { MongoClient, Collection, Db } from 'mongodb';
import { v1 } from 'uuid';

const SEQ_ID = 'osiris-sequence';
export class MongoDB implements DB {
    _client: MongoClient;
    db: Db;
    collection: Collection;
    sequences: Collection;

    dbpath: string;
    collectionName: string;

    constructor(dbpath: string, collectionName: string) {
        this.dbpath = dbpath;
        this.collectionName = collectionName;
    }

    async replaceSnapshot(context: Context, state: Event): Promise<void>{
        const session = this._client.startSession();
        try{
            await session.withTransaction(async () => {
                await this.collection.deleteMany({ [context.name]: context.value, isSnapshot: true });
                return this.insertEvent(Object.assign({}, state, { isSnapshot: true}));
            })
        } catch(e){
            console.log('The transaction was aborted due to an unexpected error: ', e);
        } finally {
            await session.endSession();
        }
    }

    async connect() {
        this._client = new MongoClient(this.dbpath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await this._client.connect();
        const db = await this._client.db();
        const collection = await db.collection(this.collectionName);
        const sequences = await db.collection('__sequences');
        collection.createIndex({
            seq: 1,
        });
        collection.createIndex({
            seq: -1,
            snapshot: 1,
        });

        const seq = await sequences.findOne({ _id: SEQ_ID });
        if (!seq) {
            await sequences.insertOne({ _id: SEQ_ID, sequence_value: 1 });            
        }

        this.db = db;
        this.collection = collection;
        this.sequences = sequences;
    }

    async disconnect() {
        await this._client.close();
    }

    async getNextSequenceValue() {
        const sequenceDocument = await this.sequences.findOneAndUpdate(
            { _id: SEQ_ID },
            { $inc: { sequence_value: 1 } },
        );

        if (!sequenceDocument.value) {
            throw new Error('invalid sequence value');
        }
        
        return sequenceDocument.value.sequence_value;
    }

    insertEvent = async (evt: any) => {
        const decorated: Event = Object.assign(
            {},
            evt,
            {
                _id: v1(),
                seq: await this.getNextSequenceValue(),
            },
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
