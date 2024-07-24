import { get_id } from '$lib/server/authorise';
import { db_client } from '$lib/server/server-store';
import { error, json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function POST({params, request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();

    let result : QueryResult<any> = await get(db_client).query("select __add_to_cart($1, $2, $3) as __added", [user_id, request_obj.product_id, request_obj.quantity]);

    return json(
    {
        success: 0,
        added: result.rows[0].__added
    });
}