import { cosmiconfig, cosmiconfigSync } from 'cosmiconfig';
import path from 'node:path';

const explorer = cosmiconfig("xxx");

async function main() {
    const result = await explorer.search(path.join(import.meta.dirname, '../'));

    console.log(result?.config);

}

main();
