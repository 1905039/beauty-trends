<script lang="ts">
    import { onMount } from "svelte";
    import Product from "./product.svelte";
    import { fade } from "svelte/transition";

    export let name: string;
    export let recommends: number[];
    export let show: boolean;

    onMount((): void =>
    {
        // fetch("/api/get-category-recommends",
        // {
        //     method: "POST",
        //     body: JSON.stringify(
        //     {
        //         id: id
        //     })
        // }).then(async (response: Response): Promise<void> =>
        // {
        //     if(response.status === 200)
        //     {
        //         let response_obj: any = await response.json();
        //         recommendations = new Array(response_obj.length);

        //         for(let i: number = 0; i < recommendations.length; ++i)
        //         {
        //             recommendations[i] = response_obj[i].__id;
        //         }

        //         show = recommendations.length === 5;
        //     }
        //     else
        //     {
        //         $unknown_error_toast_store?.show();
        //     }
        // });
    });
</script>

{#if show}
    <div class="mb-4" in:fade={{duration: 250}}>
        <div class="d-flex justify-content-center">
            <p class="fs-2 fw-semibold gray-700 m-0">{name}</p>
        </div>
        <div class="container my-3">
            <div class="row">
                {#each recommends as id}
                    <div class="product-col col-sm p-0 mb-2">
                        <Product id={id} />
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}