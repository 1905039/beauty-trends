import { get_id } from "$lib/server/authorise";
import { db_client } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function POST({request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select __edit_review($1, $2, $3)", [request_obj.id, request_obj.rate, request_obj.review]);

    if(result.rowCount === null)
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