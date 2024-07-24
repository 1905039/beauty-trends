import { db_client } from "$lib/server/server-store";
import { get } from "svelte/store";
import type { QueryResult } from "pg";
import { json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import argon2 from "argon2";

export async function POST({request, cookies}): Promise<Response>
{
    let request_obj: any = await request.json();
    let phone: string = request_obj.phone;

    if(phone.substring(0, 3) !== "+88")
    {
        phone = "+88" + phone;
    }

    let result: QueryResult<any> = await get(db_client).query("select __id, __hash from __get_id_hash($1)", [phone]);

    if(result.rowCount === null || result.rowCount === 0)
    {
        return json(
        {
            success: -2
        });
    }

    let id: number = result.rows[0].__id;
    let hash: string = result.rows[0].__hash;

    let match: boolean = await argon2.verify(hash, request_obj.password);

    if(match !== true)
    {
        return json(
        {
            success: -3
        });
    }

    let token: string = jwt.sign(
    {
        id: id
    }, JWT_SECRET);
    cookies.set("jwt", token,
    {
        httpOnly: true,
        path: "/",
        expires: new Date(new Date().getTime() + 2628000000)
    });

    return json(
    {
        success: 0
    });
}