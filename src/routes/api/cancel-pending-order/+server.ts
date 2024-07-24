import { get_id } from '$lib/server/authorise';
import { db_client } from '$lib/server/server-store';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function DELETE({request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();

    await get(db_client).query("select __cancel_order($1)", [request_obj.id]);

    return json(
    {
        success: 0
    });
}