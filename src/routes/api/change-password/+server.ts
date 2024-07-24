import { get_id } from '$lib/server/authorise.js';
import { db_client } from '$lib/server/server-store.js';
import { error, json } from '@sveltejs/kit';
import argon2 from 'argon2';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function POST({request, cookies}): Promise<Response>
{
    let uid: number = get_id(cookies.get("jwt"));

    if(uid === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select * from __get_hash($1)", [uid]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json(
        {
            success: -2
        });
    }

    let hash: string = result.rows[0].__hash;
    let valid: boolean = await argon2.verify(hash, request_obj.old_password);

    if(valid !== true)
    {
        return json(
        {
            success: -1
        });
    }

    let new_hash: string = await argon2.hash(request_obj.new_password);

    result = await get(db_client).query("select __update_password($1, $2) as __success", [uid, new_hash]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json(
        {
            success: -2
        });
    }

    if(result.rows[0].__success === 0)
    {
        return json(
        {
            success: 0
        });
    }
    
    return json(
    {
        success: -3
    });
}