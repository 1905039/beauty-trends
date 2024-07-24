import { get_id } from "$lib/server/authorise";
import { db_client } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function POST({request, cookies}): Promise<Response>
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select __update_profile($1, $2, $3) as __updated", [id, request_obj.name, request_obj.address]);

    if(result.rows[0].__updated !== true)
    {
        return json(
        {
            success: -1
        });
    }

    return json(
    {
        success: 0
    });
}