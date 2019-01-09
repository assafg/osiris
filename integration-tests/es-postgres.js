const test = require('tape');
const { Client } = require('pg');
const EventSource = require('../lib/EventSource');
const PostgresDB = require('../lib/database/postgresdb');

const table = 'test_table';
const connectionString = 'postgresql://localhost:5432/test_db';

const DB = new PostgresDB({
    table,
    connectionString,
});

const context = 'count';

const client = new Client({ connectionString });
client
    .connect()
    .then(() => {
        console.log('connected');

        test('test postgres - create manual snapshot', t => {
            client.query(`DELETE FROM "${table}"`).then(() => {
                console.log('removed');
                const es = new EventSource(context, DB, { number: true });
                const events = [];
                for (var i = 0; i < 5; i++) {
                    events.push(es.onEvent({ [`${i}`]: i }));
                }
                Promise.all(events).then(() => {
                    es.getState(false).then(state => {
                        t.deepEqual(state, {
                            context: 'count',
                            '0': 0,
                            '1': 1,
                            '2': 2,
                            '3': 3,
                            '4': 4,
                        });
                        client.query(`SELECT count(*) as num FROM "${table}"`).then(data => {
                            t.equal(Number(data.rows[0].num), 5);
                            es.getState().then(state => {
                                setTimeout(() => {
                                    // takes time for the snapshot to update
                                    client.query(`SELECT COUNT(*) as num FROM "${table}"`).then(data => {
                                        t.equal(Number(data.rows[0].num), 6);
                                        t.end();
                                    });
                                }, 200);
                            });
                        });
                    });
                });
            });
        });

        test('test postgres - aggregate', t => {
            client.query(`DELETE FROM "${table}"`).then(() => {
                console.log('removed');
                const es = new EventSource(context, DB, { number: true });
                const events = [];
                for (var i = 0; i < 10; i++) {
                    events.push(es.onEvent({ number: 1 }));
                }
                Promise.all(events).then(() => {
                    es.getState().then(state => {
                        t.equal(state.number, 10);
                        t.end();
                    });
                });
            });
        });

        test('test postgres', t => {
            client.query(`DELETE FROM "${table}"`).then(() => {
                console.log('removed');
                const es = new EventSource(context, DB, { number: true });
                const events = [];
                for (var i = 0; i < 5; i++) {
                    events.push(es.onEvent({ [`${i}`]: i }));
                }
                Promise.all(events).then(() => {
                    es.getState().then(state => {
                        t.deepEqual(state, {
                            context: 'count',
                            '0': 0,
                            '1': 1,
                            '2': 2,
                            '3': 3,
                            '4': 4,
                        });
                        t.end();
                    });
                });
            });
        });
    })
    .catch(e => console.error('connection error', err.stack));
