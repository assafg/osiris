const test = require('tape');
const mongojs = require('mongojs');
const db = mongojs('osiris-test', ['testCollection']);
const EventSource = require('../lib/EventSource');
const MongoDB = require('../lib/database/mongodb');
const DB = new MongoDB({ dbpath: 'osiris-test', collection: 'testCollection' });

const context = 'count';

// test('test mongodb - aggregate', t => {
//     const es = new EventSource(DB, { number: true });
//     db.testCollection.remove({}, () => {
//         console.log('removed');
//         const events = [];
//         for (var i = 0; i < 10; i++) {
//             events.push(es.onEvent({ context, number: 1 }));
//         }
//         Promise.all(events).then(() => {
//             es.getState(context).then(state => {
//                 console.log('state :', state);
//                 t.equal(state.number, 10);
//                 t.end();
//             });
//         });
//     });
// });

// test('test mongodb', t => {
//     const es = new EventSource(DB);
//     db.testCollection.remove({}, () => {
//         console.log('removed');
//         const events = [];
//         for (var i = 0; i < 5; i++) {
//             events.push(es.onEvent({ context, [`${i}`]: i }));
//         }
//         Promise.all(events).then(() => {
//             es.getState(context).then(state => {
//                 t.deepEqual(state, {
//                     context: 'count',
//                     '0': 0,
//                     '1': 1,
//                     '2': 2,
//                     '3': 3,
//                     '4': 4,
//                 });
//                 t.end();
//             });
//         });
//     });
// });

test('test mongodb - create manual snapshot', t => {
    const es = new EventSource(DB);
    db.testCollection.remove({}, () => {
        console.log('removed');
        const events = [];
        for (var i = 0; i < 5; i++) {
            events.push(es.onEvent({ context, [`${i}`]: i }));
        }
        Promise.all(events).then(() => {
            es.getState(context, false).then(state => {
                t.deepEqual(state, {
                    context: 'count',
                    '0': 0,
                    '1': 1,
                    '2': 2,
                    '3': 3,
                    '4': 4,
                });
                db.testCollection.find({}).count((err, num) => {
                    t.equal(num, 5);
                    es.getState(context).then(state => {
                        db.testCollection.find({}).count((err, num) => {
                            t.equal(num, 6);
                            t.end();
                        });
                    });
                });
            });
        });
    });
});
