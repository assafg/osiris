import { DB, Event } from '../types';

export class Inmemmory implements DB {
    events: Event[] = [];

    insertEvent(context: string, evt: any): Promise<Event> {
        return new Promise(resolve => {
            const event = Object.assign({}, evt, {
                context,
                seq: this.events.length,
            });
            this.events.push(event);
            resolve(event);
        });
    }
    getEvents(context: string, seq?: number): Promise<Event[]> {
        return new Promise(resolve => {
            resolve([...this.events]);
        });
    }
    getSnapshot(context: string): Promise<Event> {
        return new Promise(resolve => {
            resolve(this.events.find(e => e.isSnapshot));
        });
    }
}

export default { Inmemmory };
