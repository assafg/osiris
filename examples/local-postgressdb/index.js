const PostgresDB = require('../../lib/database/postgresdb');
const EventSource = require('../../lib/EventSource');

const db = new PostgresDB({
    table: 'test_table',
    connectionString: 'postgresql://localhost:5432/test_db',
});

const es = new EventSource(db, 'test_table');
const promises = [];

const event1 = { context: 'person', street: 'fifth av' };
promises.push(es.onEvent(event1));

const event2 = { context: 'person', city: 'new york' };
promises.push(es.onEvent(event2));

Promise.all(promises).then(() => {
    es.getState('person').then(d => {
        console.log('result', d);
    });
});
