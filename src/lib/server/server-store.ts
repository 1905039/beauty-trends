import { building } from "$app/environment";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, SUPABASE_API_KEY, SUPABASE_URL } from "$env/static/private";
import { get, readable, type Readable } from "svelte/store";
import pg from 'pg';
import supabase_js from "@supabase/supabase-js";

export const supabase: Readable<supabase_js.SupabaseClient<any, "public", any>> = readable(supabase_js.createClient(SUPABASE_URL, SUPABASE_API_KEY));
export const db_client: Readable<pg.Client> = readable(new pg.Client(
{
    host: DB_HOST,
    database: DB_NAME,
    port: parseInt(DB_PORT),
    user: DB_USERNAME,
    password: DB_PASSWORD
}));

if(!building)
{
    await get(db_client).connect();
}