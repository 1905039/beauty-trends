<script lang="ts">
    import type { CartProductObj,  } from "$lib/containers";
    import { product_image_bucket, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { ImageData } from "$lib/containers";
    import { fade } from "svelte/transition";

    export let index: number;
    export let checkout_items: CartProductObj[];
    let product_id: number = checkout_items[index].product_id;
    let name: string = checkout_items[index].name;
    let unit_price: number = checkout_items[index].price;
    let quantity: number = checkout_items[index].quantity;
    let price: number = checkout_items[index].quantity;
    let image_data: ImageData;
    let image_loaded: boolean = false;

    $: image_loaded = (image_data !== undefined && image_data.loaded === true) ? true : false;
    $: init(checkout_items);

    function delete_item(): void
    {
        let temp_items: CartProductObj[] = [];

        for(let i: number = 0; i < checkout_items.length; ++i)
        {
            if(i !== index)
            {
                temp_items.push(checkout_items[i]);
            }
        }

        checkout_items = temp_items;

        localStorage.setItem("checkout-items", JSON.stringify(checkout_items));
    }
    
    function init(checkout_items: CartProductObj[]): void
    {
        product_id = checkout_items[index].product_id;
        name = checkout_items[index].name;
        unit_price = checkout_items[index].price;
        quantity = checkout_items[index].quantity;
        price = unit_price * quantity;

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
    }
</script>

<li class="item-container list-group-item placeholder-glow">
    {#if image_loaded}
        <a href="/product/{product_id}">
            <img class="item-img rounded me-2" src={image_data.data} alt="cart-product-img" in:fade={{duration: 250}} />
        </a>
    {:else}
        <span class="item-img rounded placeholder gray-500 me-2"></span>
    {/if}
    <div class="flex-fill">
        <a class="fs-4 fw-semibold gray-700 mb-2 link-underline link-underline-opacity-0" href="/product/{product_id}">{name}</a>
        <div class="item-price align-items-center mb-2">
            <p class="fs-6 fw-semibold gray-600 m-0">Unit Price ৳{unit_price}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="sperator-dot bi bi-dot gray-600" viewBox="0 0 16 16">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
            </svg>
            <p class="fs-6 fw-semibold gray-600 m-0">Total Price ৳{price}</p>
        </div>
        <div class="d-flex justify-content-end flex-wrap">
            <div class="d-flex mt-1">
                <p class="fs-6 fw-semibold gray-600 my-auto me-2">Quantity</p>
                <input bind:value={quantity} type="number" class="form-control" min="0" required style="max-width: 7em;">
            </div>
            <button on:click={delete_item} type="button" class="btn btn-danger ms-2 mt-1">Delete</button>
        </div>
    </div>
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