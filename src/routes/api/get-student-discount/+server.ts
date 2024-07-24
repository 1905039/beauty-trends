import { get_id } from '$lib/server/authorise.js';
import { db_client } from '$lib/server/server-store.js';
import type { QueryResult } from "pg";
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function GET({cookies}): Promise<Response>
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    let result: QueryResult<any> = await get(db_client).query("select * from __get_user_student_discount($1)", [id]);

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
        student_discount: result.rows[0]
    });
}