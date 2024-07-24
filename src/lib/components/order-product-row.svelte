<script lang="ts">
    import { order_products_store, product_image_bucket, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { ImageData } from "$lib/containers";
    import { respond401 } from "$lib/helpers";

    export let index: number;
    export let id: number;
    let product_id: number;
    let name: string;
    let unit_price: number;
    let quantity: number;
    let price: number;
    let data_loaded: boolean = false;
    let image_data: ImageData;
    let image_loaded: boolean = false;

    $: image_loaded = (image_data !== undefined && image_data.loaded === true) ? true : false;
    $: price = unit_price * quantity;

    onMount((): void =>
    {
        fetch("/api/get-order-product-data",
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
                let data: any = response_obj.data;
                product_id = data.__product_id;
                name = data.__title;
                quantity = data.__quantity;
                unit_price = data.__price;
                $order_products_store[index].total_price = unit_price * quantity;

                fetch("/api/get-product-images",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        id: product_id
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    if(response.status === 200)
                    {
                        let response_obj: any = await response.json();

                        if(response_obj.success === 0)
                        {
                            if(response_obj.images.length <= 0)
                            {
                                return;
                            }

                            image_data = new ImageData();
                            image_data.id = response_obj.images[0].__id;
                            let response: Response = await fetch(product_image_bucket + product_id + "-" + image_data.id + ".webp",
                            {
                                method: "GET"
                            });

                            image_data.data = URL.createObjectURL(await response.blob());
                            image_data.loaded = true
                        }
                        else
                        {
                            $unknown_error_toast_store?.show();
                            console.error(response_obj.success);
                        }
                    }
                    else
                    {
                        $unknown_error_toast_store?.show();
                    }
                });

                data_loaded = true;
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
    })
</script>

<li class="item-container list-group-item placeholder-glow">
    {#if data_loaded && image_loaded}
        <a href="/product/{product_id}">
            <img class="item-img rounded me-2" src={image_data.data} alt="cart-product-img" in:fade={{duration: 250}} />
        </a>
    {:else}
        <span class="item-img rounded placeholder gray-500 me-2"></span>
    {/if}
    {#if data_loaded}
        <div class="flex-fill" in:fade={{duration: 250}}>
            <a class="fs-4 fw-semibold gray-700 mb-2 link-underline link-underline-opacity-0" href="/product/{product_id} in:fade={{duration: 250}}">{name}</a>
            <div class="item-price align-items-center">
                <p class="fs-6 fw-semibold gray-600 m-0">Unit Price ৳{unit_price}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="sperator-dot bi bi-dot gray-600" viewBox="0 0 16 16" in:fade={{duration: 250}}>
                        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                    </svg>
                    <p class="fs-6 fw-semibold gray-600 m-0">Total Price ৳{price}</p>
            </div>
            <p class="fs-6 fw-semibold gray-600 my-auto me-2">Quantity: {quantity}</p>
        </div>
    {:else}
        <div class="flex-fill">
            <p class="fs-4 fw-semibold gray-500 mb-2">
                <span class="placeholder" style="width: 5em;"></span>
            </p>
            <div class="item-price align-items-center">
                <p class="fs-6 fw-semibold gray-500 m-0">
                    <span class="placeholder" style="width: 5em;"></span>
                </p>
                <p class="sperator-dot fs-6 my-0 mx-1"></p>
                <p class="fs-6 fw-semibold gray-500 m-0">
                    <span class="placeholder" style="width: 3em;"></span>
                </p>
            </div>
            <p class="fs-6 fw-semibold gray-500 my-auto me-2">
                <span class="placeholder" style="width: 9em;"></span>
            </p>
        </div>
    {/if}
</li>

<style lang="scss">
    .item-container
    {
        display: flex;
        flex-direction: row;
    }
    .item-img
    {
        width: 128px;
        height: 128px;
    }
    .item-price
    {
        display: flex;
        flex-direction: row;
    }
    @media (max-width: 499px)
    {
        .item-container
        {
            display: block;
        }
        .item-img
        {
            width: 100%;
            height: 100%;
            aspect-ratio: 1;
        }
        .item-price
        {
            display: block;
        }
        .sperator-dot
        {
            display: none;
        }
    }
</style>