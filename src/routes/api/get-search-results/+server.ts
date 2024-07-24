import type { QueryResult } from "pg";
import type { RouteParams } from "./$types";
import { db_client } from "$lib/server/server-store";
import { json } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function POST({request}: {params: RouteParams, request: Request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let query: string = request_obj.query;
    let result: QueryResult<any> = await get(db_client).query("select * from __get_search_results($1, $2, $3, $4, $5, $6)", [query, request_obj.min_price, request_obj.max_price, request_obj.min_sales, request_obj.max_sales, request_obj.not_discount]);

    return json(
    {
        status: 0,
        products: result.rows
    });
}