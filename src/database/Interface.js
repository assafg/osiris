// @flow
export interface DB {
    insertEvent(contex: string, evt: any): Promise<Object>;
    getEvents(context: string, seq?: number): Promise<[Object]>;
    getSnapshot(context: string): Promise<Object>;
}
