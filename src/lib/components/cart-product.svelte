<script lang="ts">
    import type { CartProductObj } from "$lib/containers";
    import { cart_items_store, product_image_bucket, stock_unavailable_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { ImageData } from "$lib/containers";
    import { respond401 } from "$lib/helpers";

    export let index: number;
    export let id: number;
    let product_id: number;
    let title: string = "";
    let price: number = 0;
    let discount: number = 0;
    let quantity: number = 0;
    let max_quantity: number = 0;
    let quantity_input: number = 0;
    let rounded_price: number = 0;
    let quantity_updated: boolean;
    let quantity_updating: boolean = false;
    let deleting: boolean = false;
    let data_loaded: boolean = false;
    let image_data: ImageData;
    let image_loaded: boolean = false;

    $: quantity_updated = quantity !== quantity_input;
    $: image_loaded = (image_data !== undefined && image_data.loaded === true) ? true : false;
    $: get_data(id);

    function get_data(id: number): void
    {
        fetch("/api/get-cart-item-data",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                cart_item_id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                product_id = response_obj.data.__product_id;
                title = response_obj.data.__title;
                price = response_obj.data.__price;
                discount = response_obj.data.__discount;
                quantity = response_obj.data.__quantity;
                max_quantity = response_obj.data.__max_quantity;
                rounded_price = Math.round(price * (1 - discount));
                quantity_input = quantity;
                $cart_items_store[index].quantity = quantity;
                $cart_items_store[index].name = title;
                $cart_items_store[index].product_id = product_id;
                $cart_items_store[index].price = rounded_price;
                $cart_items_store[index].weight = response_obj.data.__weight;

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
    }

    function cart_item_update(): void
    {
        quantity_updating = true;

        fetch("/api/update-cart-item",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                id: id,
                quantity: quantity_input
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    quantity_updating = false;

                    get_data(id);
                }
                else if(response_obj.success === -2)
                {
                    $stock_unavailable_toast_store?.show();
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
    }

    function delete_item(): void
    {
        deleting = true;

        fetch("/api/delete-cart-item",
        {
            method: "DELETE",
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
                    deleting = false;
                    let temp_cart_items: CartProductObj[] = [];

                    for(let i: number = 0; i < $cart_items_store.length; ++i)
                    {
                        if($cart_items_store[i].id !== id)
                        {
                            temp_cart_items.push($cart_items_store[i]);
                        }
                    }

                    $cart_items_store = temp_cart_items;
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
    }
</script>

<div class="item-card card card-body shadow placeholder-glow">
    {#if data_loaded && image_loaded}
        <img class="item-img rounded me-2" src={image_data.data} alt="cart-product-img" in:fade={{duration: 250}} />
    {:else}
        <span class="item-img rounded placeholder gray-500 me-2"></span>
    {/if}
    {#if data_loaded}
        <div class="d-flex flex-column flex-fill justify-content-between" in:fade={{duration: 250}}>
            <div class="mb-2">
                <a class="fs-4 fw-semibold gray-700 mb-2 link-underline link-underline-opacity-0" href={"/product/" + product_id}>{title}</a>
                <div class="d-flex align-items-center mt-2">
                    <p class="fs-6 fw-semibold orange-500 m-0 me-2">৳{rounded_price}</p>
                    {#if discount > 0.0}
                        <p class="price fs-6 fw-semibold text-decoration-line-through gray-500 m-0">৳{price}</p>
                    {/if}
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <form on:submit={cart_item_update} action="javascript:" class="d-flex">
                    <input bind:value={quantity_input} type="number" class="form-control me-2" min="1" max={max_quantity} style="max-width: 5em;">
                    {#if quantity_updated}
                        <button class="btn btn-success me-2" type="submit" disabled={quantity_updating} transition:fade={{duration: 250}}>Update</button>
                    {/if}
                </form>
                <div class="d-flex align-items-center">
                    <button on:click={delete_item} class="btn btn-danger" type="button" disabled={deleting}>Delete</button>
                </div>
            </div>
        </div>
    {:else}
        <div class="d-flex flex-column flex-fill justify-content-between">
            <div>
                <p class="fs-4 fw-semibold gray-500 mb-2">
                    <span class="placeholder col-3"></span>
                </p>
                <p class="fs-6 fw-semibold gray-500 m-0 me-2">
                    <span class="placeholder col-2"></span>
                </p>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .item-card
    {
        display: flex;
        flex-direction: row;
    }
    .item-img
    {
        width: 128px;
        height: 128px;
    }
    @media(max-width: 499px)
    {
        .item-card
        {
            display: block;
        }
        .item-img
        {
            width: 100%;
            height: 100%;
            aspect-ratio: 1;
        }
    }
</style>