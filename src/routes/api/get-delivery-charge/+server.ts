import { db_client } from "$lib/server/server-store";
import { json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";

export async function GET(): Promise<Response>
{
    let result: QueryResult<any> = await get(db_client).query("select * from __get_delivery_charge()");

    return json(result.rows[0]);
}