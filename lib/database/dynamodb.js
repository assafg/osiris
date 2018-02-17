const AWS = require('aws-sdk');
const _ = require('lodash');

class DynamoDB {
    constructor({ table = process.env.DYNAMODB_TABLE, region = process.env.REGION, endpoint }) {
        this.table = table;
        const conf = {
            region,
        };
        if (endpoint) {
            conf.endpoint = endpoint;
        }
        this.client = new AWS.DynamoDB.DocumentClient(conf);
    }

    insertEvent(evt) {
        const params = {
            TableName: this.table,
            Item: Object.assign({}, { createdAt: Date.now() }, evt),
        };

        this.client.put(params, function(err, data) {
            if (err) console.log(err);
            else console.log(data);
        });
    }

    getEvents(context, timestamp) {
        const params = {
            TableName: this.table,
            FilterExpression: 'createdAt >= :rkey and context = :ctx',
            ExpressionAttributeValues: {
                ':rkey': timestamp,
                ':ctx': context,
            },
            ScanIndexForward: false,
        };

        return new Promise((resolve, reject) => {
            this.client.scan(params, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(
                    result.Items.map(l => {
                        l.timestamp = l.createdAt;
                        delete l.createdAt;
                        return l;
                    })
                );
            });
        });
    }

    getSnapshot(context) {
        const params = {
            TableName: this.table,
            FilterExpression: 'context = :ctx AND isSnapshot = :snp',
            ExpressionAttributeValues: {
                ':ctx': context,
                ':snp': true,
            },
            ScanIndexForward: false,
        };

        return new Promise((resolve, reject) => {
            this.client.scan(params, (err, result) => {
                if (err) {
                    return reject(err);
                }
                const l = _.last(result.Items);
                l.timestamp = l.createdAt;
                delete l.createdAt;

                return resolve(l);
            });
        });
    }
}

module.exports = DynamoDB;
