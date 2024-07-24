import { get_id } from '$lib/server/authorise';
import { db_client } from '$lib/server/server-store';
import { error, json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function POST({request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select * from __get_review_data($1)", [request_obj.id]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json(
        {
            success: -1
        });
    }

    return json(
    {
        success: 0,
        data: result.rows[0]
    });
}