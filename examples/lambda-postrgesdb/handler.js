const { EventSource, PostgresDB } = require('osiris-es');
const db = new PostgresDB({
    table: process.env.TABLE_NAME,
    connectionString: process.env.PGCON,
});

const es = new EventSource(db, {
    score: true,
});

module.exports.handleEvent = (event, context, callback) => {
    const data = JSON.parse(event.body);
    if (typeof data.context !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            body: "Couldn't handle event",
        });
        return;
    }
    es
        .onEvent(data)
        .then(() => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'event handled successfully',
                }),
            };

            callback(null, response);
        })
        .catch(err => {
            callback(err, {
                statusCode: 500,
                body: 'Ooops! Something went wrong',
            });
        });
};

module.exports.getState = (event, context, callback) => {
    const { ctx } = event.pathParameters;
    es
        .getState(ctx)
        .then(state => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(state),
            };

            callback(null, response);
        })
        .catch(err => {
            callback(null, {
                statusCode: 500,
                body: {
                    message: 'Ooops! Something went wrong',
                    error: err,
                },
            });
        });
};

module.exports.snapshot = (event, context, callback) => {
    const data = JSON.parse(event.body);
    if (typeof data.context !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            body: "Couldn't handle event",
        });
        return;
    }
    es
        .snapshot(data.context)
        .then(state => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(state),
            };

            callback(null, response);
        })
        .catch(err => {
            callback(err, {
                statusCode: 500,
                body: 'Ooops! Something went wrong',
            });
        });
};
