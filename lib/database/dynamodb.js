const { v1 } = require('uuid');

class DynamoDB {
    constructor(table) {
        this.table = table;
    }
    insertEvent(evt) {
        const params = {
            TableName : this.table,
            Item: {
                HashKey: v1(),
                timestamp: Date.now(),
                ...evt
            }
        };

        var documentClient = new AWS.DynamoDB.DocumentClient();

        documentClient.put(params, function(err, data) {
            if (err) console.log(err);
            else console.log(data);
        });
    }

    getEvents(context, timestamp) {}

    getSnapshot(context) {}
}

module.exports = DynamoDB;
