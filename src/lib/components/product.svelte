<script lang="ts">
    import { ImageData } from "$lib/containers";
    import { product_image_bucket, unknown_error_toast_store } from "$lib/stores";
    import { fade } from "svelte/transition";
    import Rate from "$lib/components/rate.svelte";

    export let id: number;
    let previous_id: number;
    let name: string;
    let rate: number | null;
    let sales: number;
    let price: number;
    let discount: number = 0;
    let rounded_price: number = 0;
    let show_og_price: boolean;
    let data_loaded: boolean = false;
    let image_data: ImageData;
    let image_loaded: boolean = false;

    $: show_og_price = discount > 0.0 && rounded_price !== price;
    $: rounded_price = Math.floor(price * (1 - discount));
    $: image_loaded = (image_data !== undefined && image_data.loaded === true) ? true : false;
    $: setup_product(id);

    function setup_product(id: number): void
    {
        if(id !== previous_id)
        {
            let current_id: number = id;
            previous_id = id;
            data_loaded = false;

            fetch("/api/get-product-data",
            {
                method: "POST",
                headers:
                {
                    "content-type": "application/json"
                },
                body: JSON.stringify(
                {
                    id: current_id
                })
            }).then(async (response: Response): Promise<void> =>
            {
                if(id !== current_id)
                {
                    return;
                }

                if(response.status === 200)
                {
                    let response_obj: any = await response.json();
                    name = response_obj.data.__title;
                    rate = response_obj.data.__rate;
                    sales = response_obj.data.__sales;
                    price = response_obj.data.__price;
                    discount = response_obj.data.__discount;
                    data_loaded = true;
                }
                else
                {
                    $unknown_error_toast_store?.show();
                }
            });

            fetch("/api/get-product-images",
            {
                method: "POST",
                body: JSON.stringify(
                {
                    id: current_id
                })
            }).then(async (response: Response): Promise<void> =>
            {
                if(id !== current_id)
                {
                    return;
                }

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
                        let response: Response = await fetch(product_image_bucket + current_id + "-" + image_data.id + ".webp",
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
    }
</script>

<a class="product-root card rounded placeholder-glow shadow link-underline link-underline-opacity-0 mx-1 px-0" role="button" href={"/product/" + id} in:fade={{duration: 250}}>
    {#if data_loaded && image_loaded}
        <img src={image_data.data} class="product-img img-fluid rounded-top" alt="product" in:fade={{duration: 250}}>
    {:else}
        <span class="product-img placeholder rounded-top gray-500"></span>
    {/if}
    {#if data_loaded}
        <div class="card-body" in:fade={{duration: 250}}>
            <p class="fs-5 fw-semibold gray-700 mb-2">
                {name}
            </p>
            <div class="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="sales-tag bi bi-tags-fill my-auto me-1" viewBox="0 0 16 16">
                    <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                    <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
                </svg>
                <p class="fs-6 gray-700 m-0">{sales} Sales</p>
            </div>
            <Rate rate={rate} />
            <div class="d-flex align-items-center">
                <p class="rounded-price fs-6 fw-semibold m-0 me-2">৳{rounded_price}</p>
                {#if show_og_price}
                    <p class="price fs-6 fw-semibold text-decoration-line-through m-0">৳{price}</p>
                {/if}
            </div>
        </div>
    {:else}
        <div class="card-body">
            <p class="fs-5 gray-500 mb-2">
                <span class="placeholder col-3"></span>
            </p>
            <p class="fs-6 gray-500 m-0">
                <span class="placeholder col-5"></span>
            </p>
            <p class="fs-6 gray-500 m-0">
                <span class="placeholder col-4"></span>
            </p>
            <p class="fs-6 gray-500 m-0">
                <span class="placeholder col-3"></span>
                <span class="placeholder col-2"></span>
            </p>
        </div>
    {/if}
</a>

<style lang="scss">
    .product-root
    {
        height: 100%;
    }
    .product-img
    {
        width: 100%;
        aspect-ratio: 1;
    }
    .rate-star
    {
        color: #FFD400;
    }
    .sales-tag
    {
        color: #0D6EFD;
    }
    .price
    {
        color: #ADB5BD;
    }
    .rounded-price
    {
        color: #FD7E14;
    }
</style>