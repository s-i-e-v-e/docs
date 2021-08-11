import { DB } from "https://deno.land/x/sqlite/mod.ts";

const path = './journal-test.db';
export function db_init() {
    const db = new DB(path);
    db.query('CREATE TABLE IF NOT EXISTS numbers(n INTEGER, value TEXT);');
    db.query('CREATE INDEX IF NOT EXISTS idx_numbers_n ON numbers(n);');
    db.query('DELETE FROM numbers;');
    db.query('BEGIN');
    return db;
}

export function db_init_ro() {
    return new DB(path, {mode: 'read'});
}

export function db_get_max(db: DB) {
    const [max] = db.query('SELECT MAX(n) FROM numbers;');
    return Number(max);
}

export function db_insert(db: DB, n: number) {
    db.query('INSERT INTO numbers(n, value) VALUES(?, ?);', [n, String(n)]);
}

export function db_term(db: DB) {
    db.query('COMMIT');
    for (const [msg] of db.query("pragma integrity_check;")) {
        console.log(`sqlite::${msg}`);
    }
    db.close();
}
