import { db_init_ro, db_get_max } from "./Data.ts";

self.onmessage = async e => {
    try {
        const db = db_init_ro();
        const d = e.data;
        const xs = [];
        const n = d.offset + d.size;
        for (let i = d.offset; i < n; i++) {
            const max = db_get_max(db);
            //const max = i;
            //xs.push((i+max) % 209168);
            xs.push(i%max*7);
        }
        d.param = xs;
        await self.postMessage(d);
        self.close();
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}