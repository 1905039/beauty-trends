import { get_id } from "$lib/server/authorise";
import { db_client } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function DELETE({request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select __delete_review($1)", [request_obj.id]);

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