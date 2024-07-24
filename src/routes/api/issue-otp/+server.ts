import { SMS_API_KEY } from '$env/static/private';
import { db_client } from '$lib/server/server-store.js';
import { json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';
import { get } from 'svelte/store';

export async function PUT({request}): Promise<Response>
{
    let phone: string = (await request.json()).phone;

    if(phone.substring(0, 3) !== "+88")
    {
        phone = "+88" + phone;
    }

    let result: QueryResult<any> = await get(db_client).query("select * from __gen_otp($1)", [phone]);

    if(result.rowCount === null || result.rowCount !== 1)
    {
        return json({success: -2}); // user exists
    }

    if(result.rows[0].__otp < 0)
    {
        return json({success: result.rows[0].__otp});
    }

    let otp_form: FormData = new FormData();

    otp_form.append("api_key", SMS_API_KEY);
    otp_form.append("msg", `Your BeautyTrends OTP is ${result.rows[0].__otp}`);
    otp_form.append("to", phone);

    await fetch("https://api.sms.net.bd/sendsms",
    {
        method: "POST",
        body: otp_form
    });

    return json(
    {
        success: 0,
        start_time: result.rows[0].__issued_on
    });
}