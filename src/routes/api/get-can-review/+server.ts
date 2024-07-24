import type { QueryResult } from "pg";
import { db_client } from "$lib/server/server-store";
import { fail, json } from "@sveltejs/kit";
import { get } from "svelte/store";
import { get_id } from "$lib/server/authorise.js";

export async function POST({request, cookies}): Promise<Response>
{
    let request_obj: any = await request.json();
    let id: number = request_obj.id;
    let user_id: number = get_id(cookies.get("jwt"));
    let failure: any =
    {
        success: -1
    };

    if(user_id === 0)
    {
        return json(failure);
    }

    let result: QueryResult<any> = await get(db_client).query("select __can_review($1, $2)", [id, user_id]);

    if(result.rowCount === null || result.rowCount === 0)
    {
        return json(failure);
    }

    if(result.rows[0].__can_review === true)
    {
        return json(
        {
            success: 0
        });
    }
    else
    {
        return json(failure);
    }
}