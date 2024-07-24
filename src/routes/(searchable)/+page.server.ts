import { db_client } from "$lib/server/server-store";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function load()
{
    let result: QueryResult<any> = await get(db_client).query("select * from __get_root_categories()");
    let categories: any[] = new Array(result.rows.length);

    for(let i: number = 0; i < categories.length; ++i)
    {
        categories[i] = {metadata: result.rows[i]};
        categories[i].recommends = (await get(db_client).query("select __get_category_recommends($1) as __id", [categories[i].metadata.__id])).rows,
        categories[i].show = categories[i].recommends.length == 5;
    }

    return {categories: categories};
}