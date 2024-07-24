import type { QueryResult } from "pg";
import { db_client } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import { get_id } from "$lib/server/authorise";
import { get } from "svelte/store";

export async function GET({cookies}): Promise<Response>
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    let result: QueryResult<any> = await get(db_client).query("select * from __get_profile($1)", [id]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json(
        {
            success: -2
        });
    }

    return json(
    {
        success: 0,
        profile: result.rows[0]
    });
}