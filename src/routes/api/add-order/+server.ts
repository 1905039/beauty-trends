import { SMS_API_KEY } from '$env/static/private';
import { get_id } from '$lib/server/authorise';
import { db_client } from '$lib/server/server-store';
import { error, json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function POST({request, cookies}): Promise<Response>
{
    let user_id: number = get_id(cookies.get("jwt"));

    if(user_id === 0)
    {
        return error(401);
    }

    let request_obj: any = await request.json();
    let result: QueryResult<any> = await get(db_client).query("select * from __add_order($1, $2, $3, $4, $5, $6, $7, $8)", [user_id, request_obj.address, request_obj.products, request_obj.quantities, request_obj.sub_total_price, request_obj.student_discount, request_obj.delivery_charge, request_obj.grand_total_price]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json(
        {
            success: -1
        });
    }

    let id: number = parseInt(result.rows[0].__id);
    let price: number = parseInt(result.rows[0].__price);

    if(id > 0)
    {
        let otp_form: FormData = new FormData();

        otp_form.append("api_key", SMS_API_KEY);
        otp_form.append("msg",
        `(BeautyTrends)\nOrder ID: ${id} confirmed\nTotal Price: ${price}/-`);
        otp_form.append("to", result.rows[0].__phone);
        await fetch("https://api.sms.net.bd/sendsms",
        {
            method: "POST",
            body: otp_form
        });
    }

    return json(
    {
        success: 0,
        id: id,
        price: price
    });
}