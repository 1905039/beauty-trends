import { get_id } from '$lib/server/authorise';
import { db_client } from '$lib/server/server-store.js';
import { error, json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function POST({request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select __add_review($1, $2, $3, $4) as __success", [user_id, request_obj.product_id, request_obj.rate, request_obj.review]);

    if(result.rowCount === null || result.rowCount !== 1)
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