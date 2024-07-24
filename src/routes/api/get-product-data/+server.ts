import type { QueryResult } from "pg";
import type { RouteParams } from "./$types";
import { db_client } from "$lib/server/server-store";
import { json } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function POST({request}: {params: RouteParams, request: Request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let id: number = request_obj.id;
    let result: QueryResult<any> = await get(db_client).query("select * from __get_product_data($1)", [id]);

    return json(
    {
        status: 0,
        data: result.rows[0]
    });
}