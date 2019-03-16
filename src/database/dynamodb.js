// @flow
import { DB } from './Interface';
import AWS from 'aws-sdk';
import last from 'lodash/last';

class DynamoDB implements DB {
    table: string;
    client: Object;

    constructor({
        table = process.env.DYNAMODB_TABLE,
        region = process.env.REGION,
        endpoint,
    }: any) {
        this.table = table;
        const conf = {
            region,
            endpoint,
        };

        this.client = new AWS.DynamoDB.DocumentClient(conf);
    }

    insertEvent(context: string, evt: Object): Promise<Object> {
        const params = {
            TableName: this.table,
            Item: Object.assign({}, { seq: Date.now() }, evt),
        };

        return new Promise((resolve, reject) => {
            this.client.put(params, function(err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    getEvents(context: string, seq: number = 0): Promise<[Object]> {
        const params = {
            TableName: this.table,
            FilterExpression: 'seq >= :rkey and context = :ctx',
            ExpressionAttributeValues: {
                ':rkey': seq,
                ':ctx': context,
            },
            ScanIndexForward: false,
        };

        return new Promise((resolve, reject) => {
            this.client.scan(params, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.Items);
            });
        });
    }

    getSnapshot(context: string): Promise<Object> {
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
                const l = last(result.Items) || {};

                return resolve(l);
            });
        });
    }
}

module.exports = DynamoDB;
