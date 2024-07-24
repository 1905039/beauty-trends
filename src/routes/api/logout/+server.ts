import { json } from '@sveltejs/kit';

export async function GET({cookies}): Promise<Response>
{
    cookies.delete("jwt",
    {
        path: "/"
    });

    return json(
    {
        success: 0
    });
}