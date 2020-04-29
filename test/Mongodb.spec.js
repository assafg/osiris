const { expect } = require('chai');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { EventSource } = require('../lib');
const { MongoDB } = require('../lib/database');

const { MongoClient } = require('mongodb');

describe('Test the Event source over mongodb', () => {
    const mongod = new MongoMemoryServer();
    let db;
    let es;

    before(async () => {
        const uri = await mongod.getUri();
        db = new MongoDB(`${uri}`, 'testCollection');
        await db.connect();
        es = new EventSource(db);
    });

    after(async () => {
        console.log('After');

        db.disconnect();
        await mongod.stop();
    });

    it('should test the event source on a new DB', async () => {
        const context = {
            name: 'name',
            value: 'John Snow',
        };

        await es.onEvent({
            name: context.value,
            isOnline: true,
        });

        let state = await es.getState(context);

        expect(state).to.deep.equal({
            name: context.value,
            isOnline: true,
        });

        await es.onEvent({
            name: context.value,
            isOnline: false,
        });

        state = await es.getState(context);

        expect(state).to.deep.equal({
            name: context.value,
            isOnline: false,
        });

        const events = await db.getEvents(context);
        expect(events.length).to.equal(4);
        expect(events).to.deep.equal([
            { name: 'John Snow', isOnline: true, seq: 1 },
            { name: 'John Snow', isOnline: true, seq: 2, isSnapshot: true },
            { name: 'John Snow', isOnline: false, seq: 3 },
            { name: 'John Snow', isOnline: false, seq: 4, isSnapshot: true },
        ]);
    });

    it('should count the number of living characters', async () => {
        const es = new EventSource(db);
        await es.onEvent({
            name: 'Daenerys Targaryen',
            isAlive: true,
        });
        await es.onEvent({
            name: 'Ned Stark',
            isAlive: true,
        });

        await es.onEvent({
            name: 'John Snow',
            isAlive: true,
        });

        await es.onEvent({
            name: 'John Snow',
            isAlive: false,
        });

        await es.onEvent({
            name: 'Arya Stark',
            isAlive: true,
        });

        await es.onEvent({
            name: 'John Snow',
            isAlive: true,
        });

        await es.onEvent({
            name: 'Arya Stark',
            isAlive: true,
        });

        await es.onEvent({
            name: 'Ned Stark',
            isAlive: false,
        });

        await es.onEvent({
            name: 'Tyrion Lannister',
            isAlive: true,
        });

        await es.onEvent({
            name: 'Daenerys Targaryen',
            isAlive: false,
        });

        const uri = await mongod.getUri();

        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const _db = await client.db();
        const col = await _db.collection('testCollection');

        const docs = await col
            .aggregate([
                { $match: { isAlive: { $exists: true } } }, // find all events related to the query
                { $sort: { seq: 1 } },
                {
                    $group: {
                        _id: '$name',
                        isAlive: {
                            $last: '$isAlive',
                        },
                    },
                },
                { $match: { isAlive: true } },
            ])
            .toArray();

        const names = docs.map(d => d._id).sort();

        expect(names).to.deep.equal(['Arya Stark', 'John Snow', 'Tyrion Lannister']);

        client.close();
    });
});
