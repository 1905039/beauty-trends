import { db_client } from "$lib/server/server-store";
import { json } from "@sveltejs/kit";
import type { QueryResult } from 'pg';
import type { RouteParams } from "./$types";
import { get } from "svelte/store";

export async function POST({request}: {params: RouteParams, request: Request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let id: number = request_obj.id;
    let result: QueryResult<any> = await get(db_client).query("select * from __get_products_by_category($1, $2::int2, $3, $4, $5, $6, $7)", [id, request_obj.sort_by, request_obj.min_price, request_obj.max_price, request_obj.min_sales, request_obj.max_sales, request_obj.not_discount]);

    return json(
    {
        status: 0,
        products: result.rows
    });
}