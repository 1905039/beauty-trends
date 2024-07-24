<script lang="ts">
    import { respond401 } from "$lib/helpers";
    import { unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    export let index: number;
    export let id: number;
    let issued_on: Date;
    let status: number;
    let date_string: string;
    let time_string: string;
    let loaded: boolean = false;

    $: date_string = issued_on?.toLocaleDateString();
    $: time_string = issued_on?.toLocaleTimeString();

    onMount((): void =>
    {
        fetch("/api/get-complete-order-data-sm",
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
                    status = response_obj.data.__status;
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
                <p class="gray-700 m-0">{id}</p>
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
                <p class="gray-700 m-0">
                    {#if status === 0}
                        Cancelled
                    {:else if status === 1}
                        Deliverying
                    {:else if status === 2}
                        Delivered
                    {:else}
                        Unknown
                    {/if}
                </p>
            </a>
        </td>
    </tr>
{:else}
    <tr>
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
                <span class="placeholder col-5"></span>
            </p>
        </td>
    </tr>
{/if}