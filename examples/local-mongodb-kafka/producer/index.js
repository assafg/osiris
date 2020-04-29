const Kafka = require('node-rdkafka');
const faker = require('faker');

const producer = new Kafka.Producer({
    'client.id': 'kafka',
    'metadata.broker.list': 'localhost:9092',
    'compression.codec': 'gzip',
    'retry.backoff.ms': 200,
    'message.send.max.retries': 10,
    'socket.keepalive.enable': true,
    'queue.buffering.max.messages': 100000,
    'queue.buffering.max.ms': 1000,
    'batch.num.messages': 1000000,
    dr_cb: true,
});

// Connect to the broker manually
producer.connect();

// Wait for the ready event before proceeding
producer.on('ready', function() {
    try {
        // [...Array(30).keys()].forEach(createUser);

        // create a user every 10 second
        setInterval(createUser, 10000);
    } catch (err) {
        console.error('A problem occurred when sending our message');
        console.error(err);
    }
});

const createUser = () => {
    const id = faker.random.uuid();

    sendMessage({
        id,
        email: faker.internet.email(),
    });

    sendMessage({
        id,
        name: faker.name.findName(),
    });

    sendMessage({
        id,
        address: {
            city: faker.address.city(),
            streetAddress: faker.address.streetAddress(),
            country: faker.address.country(),
            zip: faker.address.zipCode(),
        },
    });
};

const sendMessage = (msg, topic = 'osiris-messages') => {
    console.log('sending', msg.id);
    
    producer.produce(
        // Topic to send the message to
        topic,
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        null,
        // Message to send. Must be a buffer
        Buffer.from(JSON.stringify(msg)),
        // for keyed messages, we also specify the key - note that this field is optional
        'Stormwind',
        // you can send a timestamp here. If your broker version supports it,
        // it will get added. Otherwise, we default to 0
        Date.now()
        // you can send an opaque token here, which gets passed along
        // to your delivery reports
    );
};
