import { db_init, db_insert, db_term } from "./Data.ts";

interface WorkerData {
    name: string,
    cmd: string,
    offset: number,
    size: number,
    param: any,
}
type Work = (d: WorkerData) => any;

function split_work(count: number, threads: number, param: any) {
    const size = Math.floor(count/threads)+1;
    let offset = 0;
    const ys = [] as WorkerData[];
    for (let i = 0; i < threads; i++) {
        const sz = Math.min(size, count - offset);
        ys.push({
            name: `w${i}`,
            cmd: 'init',
            offset: offset,
            size: sz,
            param: param,
        });
        offset += sz ;
    }
    return ys;
}

function build_workers(count: number, threads: number, fn: Work) {
    const ds = split_work(count, threads, undefined);
    ds.forEach(d => {
        const w = new Worker(new URL('./Worker.ts', import.meta.url).href, {
            type: "module",
            deno: true,
        });
        w.onmessage = e => fn(e.data);
        w.postMessage(d);
    });
}

const SOME_BIG_NUMBER = 1_000_000;
const MAX_THREADS = 16;

const total = SOME_BIG_NUMBER;
let running_total = 0;
const db = db_init();

const on_done = (d: WorkerData) => {
    running_total += d.param.length;
    d.param.forEach((i: number) => db_insert(db, i));
    console.log(`${d.name}|INSERT|${running_total}/${total})`);

    if (running_total === total) {
        console.log(`term`);
        db_term(db);
    }
}

build_workers(SOME_BIG_NUMBER, MAX_THREADS, on_done);