import { JWT_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";

export function get_id(token: string | undefined): number
{
    if(token === undefined)
    {
        return 0;
    }

    let payload: any;

    try
    {
        payload = jwt.verify(token, JWT_SECRET);
    }
    catch(err)
    {
        return 0;
    }

    return payload.id;
}