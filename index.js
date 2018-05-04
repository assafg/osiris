module.exports = {
    EventSource: require('./lib/EventSource'),
    DynamoDB: require('./lib/database/dynamodb'),
    MongoDB: require('./lib/database/mongodb'),
    PostgresDB: require('./lib/database/postgresdb'),
};
