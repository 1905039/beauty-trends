import { get_id } from "$lib/server/authorise";
import { db_client } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function GET({cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let result: QueryResult<any> = await get(db_client).query("select __get_pending_orders($1) as __id", [user_id]);

    return json(
    {
        success: 0,
        pending_orders: result.rows
    });
}