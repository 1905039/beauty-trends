import { get_id } from "$lib/server/authorise";
import { db_client, supabase } from "$lib/server/server-store";
import { error, json } from "@sveltejs/kit";
import type { QueryResult } from "pg";
import { get } from "svelte/store";
import sharp from "sharp";

export async function POST({request, cookies}): Promise<Response>
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    let request_form_data: FormData = await request.formData();
    let front_entry: FormDataEntryValue | null = request_form_data.get("front");
    let back_entry: FormDataEntryValue | null = request_form_data.get("back");

    if(front_entry === null)
    {
        return json(
        {
            success: -1
        });
    }

    if(back_entry === null)
    {
        return json(
        {
            success: -2
        });
    }

    let front_array_buffer: ArrayBuffer = await (front_entry.slice() as Blob).arrayBuffer();
    let back_array_buffer: ArrayBuffer = await (back_entry.slice() as Blob).arrayBuffer();
    let front_blob: Blob = new Blob([await sharp(front_array_buffer).webp().toBuffer()],
    {
        type: "image/webp"
    });
    let back_blob: Blob = new Blob([await sharp(back_array_buffer).webp().toBuffer()],
    {
        type: "image/webp"
    });

    let upload_result: any = await get(supabase).storage.from("student-apply-image").upload(id + "-front.webp", front_blob, {upsert: true});

    if(upload_result.error)
    {
        console.error(upload_result.error);

        return json(
        {
            success: -3
        });
    }

    upload_result = await get(supabase).storage.from("student-apply-image").upload(id + "-back.webp", back_blob, {upsert: true});

    if(upload_result.error)
    {
        console.error(upload_result.error);

        return json(
        {
            success: -4
        });
    }

    await get(db_client).query("select * from __apply_student($1)", [id]);

    return json(
    {
        success: 0
    });
}