import { get_id } from "$lib/server/authorise.js";
import { error, json } from "@sveltejs/kit";

export async function GET({cookies}): Promise<Response>
{
    let id: number = get_id(cookies.get("jwt"));

    if(id === 0)
    {
        return error(401);
    }

    return json(
    {
        success: 0,
        id: id
    });
}