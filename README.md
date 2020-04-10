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

The EventSource class was writtern to be abstracted away from the underlying database. Since the pattern is very generic and can manage creating states from almosta ny data model, an underlying document DB such as MongoDB is ideal in keeping the mechanism generic.

```javascript

const { EventSource, MongoDB } = require('osiris-es');
const db = new MongoDB('mongodb://localhost:27017/my-db', 'my-collection');
    await db.connect();
    // initialize the EventSource with the DB connector
    const es = new EventSource(db);
...

es.onEvent({
    name: 'Bob', 
    company: 'Hooly',
    ... 
})

es.onEvent({
    name: 'Bob',
    title: 'VP Past Mistakes',
    ... 
})

const context = {
    name: 'name', // the property we want to source by
    value: 'Bob', // the value we want to source by
}

es.getState(context)
    .then(state => {
        console.log(state); 
        /*
        {
            name: 'Bob',
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
    name: 'Bob',
    overtime: 1
})
es.onEvent({
    name: 'Bob',
    overtime: 3
})

es.getState(context)
    .then(state => {
        console.log(state); 
        /*
        {
            name: 'Bob',
            overtime: 4,
        }
        */
    })
    .catch(err => {
        console.error(err);
    });

```

### What is "Context"
Since we are storing generic events that may or may not have a common denominator, when requesting a state we pass a `contxt` which is a property name and value. The `context` is the "subject" fot the query. Let's say I'm storing user information. If I want the state of a specific user, I will choose a unique user identifier as the context name and the specific user's id ass the value. If I want the state of a company (aggregated state of all the events for the specific company, then context's name will be the company's identifier (e.g. "company-name") and the value will be the company's name.
Consider the following sourced events:

```
{ name: 'bob', company: 'acme', salary: 1000, seq: 1000 }
{ name: 'jane', company: 'acme', salary: 2000, seq: 1001 }
{ name: 'nancy', company: 'acme', salary: 4000, seq: 1002 }
{ name: 'bob', company: 'globex', salary: 1500, seq: 1003 }
{ company: 'acme', addrss: '2514  Maryland Avenue, Polk City, FL', seq: 1004}
```
To get the state of 'bob': 
```javascript
const es = new EventSource(db);
es.getState({
    name: 'name',
    value: 'bob'
}).then(state => {
   // State should be: { name: 'bob', company: 'globex', salary: 1500, seq: 1003 }
)
```
and to get the state of 'acme' company:
```javascript
const es = new EventSource(db, { salary: true });
es.getState({
    name: 'company',
    name: 'acme'
}).then(state => {
   // State should be: 
   /*
   { 
       name: 'nancy', 
       company: 'acme', 
       salary: 7000, 
       addrss: '2514  Maryland Avenue, Polk City, FL', 
       seq: 1004
    }
   */
  //Notice that the salary is the aggregation of all the salaries and the name is the name of the last employee event's name - 'nancy'
)

```
Using different *contexts* for a single store can be tricky and may require specific indices and a more fine-grained aggregation
behavior.
The intention of this library is to provide a simple solution for explicit use cases and ***not*** to cover all the edge-cases. in the example above a better approach would be to create a separate store for the company state.

### Snapshot
Over time the number of events can get large and the time to retrieve and reduce the state can be time-consuming therefore we create snapshots that will be the basis of next states' calculation. Currently, the snapshot is taken automatically if on state retrieval there are over 1000 events (this passive approach can be dangerous a state is created infrequently - in this case a snapshot should be created actively by calling `es.snapshot()`.

### Supported Databases
- MongoDB

I have removed the support for Postgres and DynamoDB in favor for a mor generic suport and tests in MongoDB. The support for other DBs may be added in the future

## Next Steps:
- Better Documentation and API Documentation
- Tests
- More DB Implementations
- More examples
- Support for archiving / deleting records
