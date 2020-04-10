import { DB, Event, Context } from '../types';

export class Inmemmory implements DB {
    events: Event[] = [];

    insertEvent(evt: any): Promise<Event> {
        return new Promise(resolve => {
            const event = Object.assign({}, evt, {
                seq: this.events.length,
            });
            this.events.push(event);
            resolve(event);
        });
    }
    getEvents(context: Context, seq?: number): Promise<Event[]> {
        return new Promise(resolve => {
            resolve([...this.events.filter((e: Event) => e[context.name] === context.value )]);
        });
    }
    getSnapshot(context: Context): Promise<Event> {
        return new Promise(resolve => {
            resolve(this.events.find(e => e.isSnapshot && e[context.name] === context.value));
        });
    }
}

export default { Inmemmory };
