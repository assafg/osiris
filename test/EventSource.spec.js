const test = require('tape');
const { EventSource } = require('..');
const { Inmemmory } = require('../lib/database/inmemmory');

test('test reducer', function(t) {
    const events = [
        { context: 'John Doe', score: 2 },
        { context: 'John Doe', score: 3 },
        { context: 'John Doe', score: 4 },
        { context: 'John Doe', score: 1 },
    ];

    const simpleState = new EventSource(Inmemmory, 'John Doe');
    const expected1 = {
        context: 'John Doe',
        score: 1, // last event's value
    };

    let result = events.reduce(simpleState.reducer, {});
    t.deepEqual(result, expected1, 'objects should be equal');

    const aggregateScore = new EventSource(
        {},
        {
            score: true,
        }
    );
    const expected2 = {
        context: 'John Doe',
        score: 10,
    };
    result = events.reduce(aggregateScore.reducer, {});
    t.deepEqual(result, expected2, 'objects should be equal');
    t.end();
});

test('test reducing of complex objects', function(t) {
    const events = [
        { context: 'Sherlock', address: { street: 'Baker st' } },
        { context: 'Sherlock', address: { number: 25 } },
        { context: 'Sherlock', address: { city: 'London' } },
        { context: 'Sherlock', profession: 'detective' },
    ];

    const es = new EventSource();
    const expected = {
        context: 'Sherlock',
        address: {
            street: 'Baker st',
            number: 25,
            city: 'London',
        },
        profession: 'detective',
    };

    const result = events.reduce(es.reducer, {});
    t.deepEqual(result, expected, 'objects should be equal');
    t.end();
});

test('test delete', function(t) {
    const events = [
        { context: 'Sherlock', address: { street: 'Baker st' } },
        { context: 'Sherlock', address: { number: 25 } },
        { context: 'Sherlock', address: { city: 'London' } },
        { context: 'Sherlock', address: { number: null } },
    ];

    const es = new EventSource();
    const expected = {
        context: 'Sherlock',
        address: {
            street: 'Baker st',
            number: null,
            city: 'London',
        },
    };

    const result = events.reduce(es.reducer, {});
    t.deepEqual(result, expected, 'objects should be equal');
    t.end();
});
