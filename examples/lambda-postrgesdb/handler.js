const { EventSource, PostgresDB } = require('osiris-es');
const db = new PostgresDB({
    table: process.env.TABLE_NAME,
    connectionString: process.env.PGCON,
});

const es = new EventSource(db, {
    score: true,
});

module.exports.handleEvent = async (event, context) => {
    const data = JSON.parse(event.body);
    if (typeof data.context !== 'string') {
        console.error('Validation Failed');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Couldn't handle event",
            }),
        };
    }
    try {
        const state = await es.onEvent(data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'event handled successfully',
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Ooops! Something went wrong',
            error: err,
        };
    }
};

module.exports.getState = async (event, context) => {
    const { ctx } = event.pathParameters;
    try {
        const state = await es.getState(ctx);
        return {
            statusCode: 200,
            body: JSON.stringify(state),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: {
                message: 'Ooops! Something went wrong',
                error: err,
            },
        };
    }
};

module.exports.snapshot = async (event, context) => {
    const data = JSON.parse(event.body);
    if (typeof data.context !== 'string') {
        console.error('Validation Failed');
        return {
            statusCode: 400,
            body: "Couldn't handle event",
        };
    }
    try {
        const state = await es.snapshot(data.context);
        return {
            statusCode: 200,
            body: JSON.stringify(state),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Ooops! Something went wrong',
            error: err,
        };
    }
};
