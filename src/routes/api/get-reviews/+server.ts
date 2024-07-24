import { db_client } from "$lib/server/server-store";
import { json } from "@sveltejs/kit";
import type { QueryResult } from 'pg';
import { get } from "svelte/store";
import { get_id } from "$lib/server/authorise";

export async function POST({request, cookies}): Promise<Response>
{
    let request_obj: any = await request.json();
    let user_id: number = get_id(cookies.get("jwt"));
    let id: number = request_obj.id;
    let result: QueryResult<any> = await get(db_client).query("select * from __get_reviews($1, $2)", [user_id, id]);

    if(result.rowCount === null)
    {
        return json(
        {
            success: -1
        });
    }

    let owned: boolean = false;

    if(result.rowCount > 0 && result.rows[0].__user_id == user_id)
    {
        owned = true;
    }

    return json(
    {
        success: 0,
        reviews: result.rows,
        owned: owned
    });
}