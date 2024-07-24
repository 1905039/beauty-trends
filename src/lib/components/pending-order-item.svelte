<script lang="ts">
    import { respond401 } from "$lib/helpers";
    import { unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    export let index: number;
    export let id: number;
    let issued_on: Date;
    let verified: boolean;
    let date_string: string;
    let time_string: string;
    let loaded: boolean = false;

    $: date_string = issued_on?.toLocaleDateString();
    $: time_string = issued_on?.toLocaleTimeString();

    onMount((): void =>
    {
        fetch("/api/get-pending-order-data-sm",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    issued_on = new Date(response_obj.data.__issued_on);
                    verified = response_obj.data.__verified;
                    loaded = true;
                }
                else
                {
                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }
            }
            else if(response.status === 401)
            {
                respond401();
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    });
</script>

{#if loaded}
    <tr in:fade={{duration: 250}}>
        <td>
            <a href="/order/{id}" class="link-underline link-underline-opacity-0">
                <p class="gray-700 m-0">{index + 1}</p>
            </a>
        </td>
        <td>
            <a href="/order/{id}" class="link-underline link-underline-opacity-0">
                <p class="gray-700 m-0">
                    {id}
                </p>
            </a>
        </td>
        <td>
            <a href="/order/{id}" class="link-underline link-underline-opacity-0">
                <p class="gray-700 m-0">{date_string}</p>
                <p class="gray-700 m-0">{time_string}</p>
            </a>
        </td>
        <td>
            <a href="/order/{id}" class="link-underline link-underline-opacity-0">
                {#if verified}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check text-success" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                        <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban text-danger" viewBox="0 0 16 16">
                        <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                    </svg>
                {/if}
            </a>
        </td>
    </tr>
{:else}
    <tr class="placeholder-glow">
        <td>
            <p class="gray-700 m-0">{index + 1}</p>
        </td>
        <td>
            <p class="gray-500 m-0">
                <span class="placeholder col-2"></span>
            </p>
        </td>
        <td>
            <p class="gray-500 m-0">
                <span class="placeholder col-4"></span>
            </p>
            <p class="gray-500 m-0">
                <span class="placeholder col-5"></span>
            </p>
        </td>
        <td>
            <p class="gray-500 m-0">
                <span class="placeholder col-2"></span>
            </p>
        </td>
    </tr>
{/if}