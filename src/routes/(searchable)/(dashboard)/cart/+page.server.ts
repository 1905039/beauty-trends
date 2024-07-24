import { get_id } from "$lib/server/authorise";
import { db_client } from "$lib/server/server-store";
import { error } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function load({cookies})
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    let result: QueryResult<any> = await get(db_client).query("select * from __get_cart_items($1)", [id]);

    return {cart_items: result.rows};
}