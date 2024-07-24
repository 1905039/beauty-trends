import { get } from "svelte/store";
import { logged_in, unauthorized_toast_store } from "./stores";
import { goto } from "$app/navigation";

export function respond401(): void
{
    get(unauthorized_toast_store)?.show();
    logged_in.set(false);
    goto("/");
}