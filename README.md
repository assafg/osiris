# Osiris
## Simple event sourceing for node (Beta)
> Osiris is an Egyptian god, identified as the god of the afterlife, the underworld, and the dead, 
> but more appropriately as the god of transition, resurrection, and regeneration
   
This project tries to make event sourcing simple and straight forward.

### Usage

```
npm install osiris-es --save
``` 
or
```
yarn add osiris-es
```

Once installed you can use the main EventSource class to store and manage any model as an event-source

```javascript
const { EventSource, DynamoDB } = require('osiris-es');
const db = new DynamoDB({
    table: '[Model Name]', 
    region: 'us-west-2', // Set your desired region
    endpoint: 'http://localhost:8000', // Omit for production 
});

const es = new EventSource(db);
...

es.onEvent({
    context: 'Bob', // The context is the key of the event source
    company: 'Hooly',
    ... 
})
es.onEvent({
    context: 'Bob', // The context is the key of the event source
    title: 'VP Past Mistakes',
    ... 
})

es.getState(context)
    .then(state => {
        console.log(state); 
        /*
        {
            context: 'Bob',
            company: 'Hooly',
            title: 'VP Past Mistakes',
        }
        */
    })
    .catch(err => {
        console.error(err);
    });

```

You can also ask the EventSource to aggregate specific fields:

```javascript
...
const es = new EventSource(db, {
   overtime: true
});
...

es.onEvent({
    context: 'Bob',
    overtime: 1
})
es.onEvent({
    context: 'Bob',
    overtime: 3
})

es.getState(context)
    .then(state => {
        console.log(state); 
        /*
        {
            context: 'Bob',
            overtime: 4,
        }
        */
    })
    .catch(err => {
        console.error(err);
    });

```

### Backing DB
The backing DB is actually a single collection (Mongo) or Table (any other DB) that acts as the persistance to the "context" or model.
The DB should have 2 indises: "context" (string/hash) and "createdAt" (number/RANGE) - the indices should not be unique but the "createdAt" should be asscending so the queries will bring the oldest records first. When reducing the results to a single state we want the last record (i.e. event) to be the most significant.

### Current limitations
For the sake of simplicity, this model currently only fully supports first level aggregation/merge - if a more complex model is stored then the merge operation will override the first level elements:

```javascript
event0 = {
   context: 'John',
   family: {
      father: 'Mike',
      Mother: 'Mary',
   }
   
event1 = {
   context: John,
   family: {
      uncle: 'Bob',
   }
}   
 ...
 // State will be
 state = {
   context: 'John',
   family: { // the last will be overriden
      uncle: 'Bob',
   }
}
```

Instead use a flat model for best results:

```javascript
event0 = {
   context: 'John',
   family_father: 'Mike',
   family_Mother: 'Mary'
}
   
event1 = {
   context: 'John',
   family_uncle: 'Bob'
}
   
 ...
 // State will be
 state = {
   context: John,
   family_father: Mike,
   family_Mother: Mary,
   family_uncle: Bob
}
```

## Next Steps:
- Better Documentation and API Documentation
- Tests
- More DB Implementations
- More examples
- Support for archiving / deleting records
