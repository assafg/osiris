# Osiris
## Simple event sourceing for node
    Osiris is an Egyptian god, identified as the god of the afterlife, the underworld, and the dead, but more appropriately as the god of transition, resurrection, and regeneration
   
This projec tries to make event sourcing simple and straight forward.

### Usage

```
npm install osiris-es --save
``` 

```
yarn add osiris-es
```

Once installed you can use the main EventSource class to store and manage any model as an event-source

```javascript
const EventSource = require('../index');
const DynamoDB = require('../lib/database/dynamodb');
const db = new DynamoDB({
    table: '[Model Name]', 
    region: 'us-west-2', // Set your desired region
    endpoint: 'http://localhost:8000', // Omit for production 
});

const es = new EventSource(db);
...

es.onEvent({
    context, // The context is the key of the event source
    ... 
})

es.getState(context)
    .then(state => {
        console.log(state);
    })
    .catch(err => {
        console.error(err);
    });

```


    