# Osiris
## Simple event sourcing for nodejs (Beta)
> Osiris is an Egyptian god, identified as the god of the afterlife, the underworld, and the dead, 
> but more appropriately as the god of transition, resurrection, and regeneration
   
This project tries to make event sourcing simple and straight forward.

*If you're new to Event Sourcing a good reference can be found [here](http://microservices.io/patterns/data/event-sourcing.html)*

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
### What is "Context"
"Context" in this project is the "subject" fot the query. Let's say I'm storing user information then the "context" will be the user identifier. If I want the state of all the users in a specific *company* then the context will be the company's identifier.
Consider the following sourced events:
```
{ name: 'bob', company: 'acme', salary: 1000, createdAt: 1000 }
{ name: 'jane', company: 'acme', salary: 2000, createdAt: 1001 }
{ name: 'nancy', company: 'acme', salary: 4000, createdAt: 1002 }
{ name: 'bob', company: 'globex', salary: 1500, createdAt: 1003 }
```
To get the state of 'bob': 
```javascript
const es = new EventSource(db);
es.getState('bob').then(state => {
   // State should be: { name: 'bob', company: 'globex', salary: 1500, createdAt: 1003 }
)
```
and to get the state of 'acme' company:
```javascript
const es = new EventSource(db, { salary: true });
es.getState('acme').then(state => {
   // State should be: { name: 'nancy', company: 'acme', salary: 7000, createdAt: 1002 }
)

```
Using different *contexts* for a single store can be tricky and may require specific indices and a more fine-grained aggregation
behavior.
The intention of this library is to provide a simple solution for explicit use cases and ***not*** to cover all the edge-cases. in the example above a better approach would be to create a separate store for the company state.

### Backing DB
The backing DB is actually a single collection (Mongo) or Table (any other DB) that acts as the persistence to the "context" or model.
The DB should have 2 indices: "context" (string/hash) and "createdAt" (number/RANGE) - the indices should not be unique but the "createdAt" should be ascending so the queries will fetch the oldest records first. When reducing the results to a single state we want the last record (i.e. event) to be the most significant.

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

### Snapshot
Over time the number of events can get large and the time to retrieve and reduce the state can be time-consuming therefore we create snapshots that will be the basis of next states' calculation. Currently, the snapshot is taken automatically if on state retrieval there are over 1000 events (this passive approach can be dangerous a state is created infrequently - in this case a snapshot should be created actively by calling `es.snapshot()`.

## Next Steps:
- Better Documentation and API Documentation
- Tests
- More DB Implementations
- More examples
- Support for archiving / deleting records
