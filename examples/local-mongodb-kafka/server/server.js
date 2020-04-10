const express = require('express');
const Kafka = require('node-rdkafka');

const { EventSource } = require('../../../lib');
const { MongoDB } = require('../../../lib/database');

const app = express();
const port = 3000;

(async () => {
    const db = new MongoDB('mongodb://localhost:27017/osiris', 'testCollection');
    await db.connect();
    const es = new EventSource(db);

    app.get('/:contextName/:contextValue', async (req, res) => {
        const start = Date.now();
        const { contextName, contextValue } = req.params;
        const state = await es.getState({
            name: contextName,
            value: contextValue,
        });

        res.send(Object.assign({ took: Date.now() - start}, state));
    });

    app.get('/event/:contextName/:contextValue', async (req, res) => {
        const { contextName, contextValue } = req.params;
        const all = await db.getEvents({
            name: contextName,
            value: contextValue,
        });
        res.send(all);
    });

    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

    consumer.connect((err) => {
        if(err) {
            console.error(err);
        }
    });

    consumer
        .on('ready', () => {              
            consumer.subscribe(['osiris-messages']);
            consumer.consume();
        })
        .on('data', async data => {
            try {
                const message = JSON.parse(data.value.toString());
                await es.onEvent(message);
                consumer.commit(data);
            } catch (err) {
                console.error(err);
            }
        });
})();

var consumer = new Kafka.KafkaConsumer({
    'group.id': 'kafka',
    'metadata.broker.list': 'localhost:9092',
    'offset_commit_cb': function(err, topicPartitions) {
        if (err) {
          // There was an error committing
          console.error(err);
        }
      }
});
