import { db_client } from "$lib/server/server-store";
import type { QueryResult } from "pg";
import { json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { get } from "svelte/store";
import argon2 from "argon2";

export async function POST({request, cookies}): Promise<Response>
{
    let request_obj: any = await request.json();
    let phone: string = request_obj.phone;

    if(phone.substring(0, 3) !== "+88")
    {
        phone = "+88" + phone;
    }

    let password_hash: string = await argon2.hash(request_obj.password);
    let result: QueryResult<any> = await get(db_client).query("select __add_user($1, $2, $3, $4) as __new_id", [phone, request_obj.user_name, password_hash, request_obj.otp]);

    if(result.rowCount !== 1)
    {
        return json(
        {
            success: null
        });
    }

    let new_id: number = result.rows[0].__new_id;

    if(new_id == 0)
    {
        return json(
        {
            success: 0
        });
    }

    let token: string = jwt.sign(
    {
        id: new_id
    }, JWT_SECRET);
    cookies.set("jwt", token,
    {
        httpOnly: true,
        path: "/",
        expires: new Date(new Date().getTime() + 2628000000)
    });

    return json(
    {
        success: new_id
    });
}