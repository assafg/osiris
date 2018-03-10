const { Client } = require('pg');

class PostresDB {
    constructor({ connectionString, table }) {
        this.table = table;
        this.client = new Client({ connectionString });
        this.client.connect(err => {
            if (err) {
                return console.log(err);
            }
            this.initTable();
        });
    }

    initTable() {
        this.client
            .query(
                `CREATE TABLE IF NOT EXISTS ${this.table} (
                    id SERIAL NOT NULL PRIMARY KEY,
                    context text NOT NULL,
                    data JSON NOT NULL,
                    isSnapshot boolean
                )`
            )
            .then(() => {
                this.client.query(`CREATE INDEX IF NOT EXISTS context_idx ON ${this.table}(context)`);
            })
            .catch(e => {
                if (e) {
                    console.log(e);
                }
            });
    }

    insertEvent(evt) {
        const query = `INSERT INTO ${this.table}(context, data, isSnapshot) values($1, $2, $3)`;
        this.client.query(query, [evt.context, evt, evt.isSnapshot]);
    }

    getEvents(context, id = 0) {
        const query = `SELECT id as seq, data FROM ${this.table} WHERE id>=$1 AND context=$2 ORDER by id`;
        return this.client.query(query, [id, context]).then(res => res.rows);
    }

    getSnapshot(context) {
        const query = `select id as seq, data FROM ${
            this.table
        } WHERE context=$1 AND isSnapshot=true ORDER BY id DESC LIMIT 1`;
        return this.client.query(query, [context]).then(res => {
            if (res.rows.length === 0) {
                return {};
            }
            return res.rows[0];
        });
    }
}

module.exports = PostresDB;
