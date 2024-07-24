<script lang="ts">
    import Product from "$lib/components/product.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { ProductObj } from "$lib/containers";
    import { now_time, unknown_error_toast_store } from "$lib/stores";
    import { fade } from "svelte/transition";

    let timestamp: number;
    let encoded_query: string | null;
    let products: (ProductObj[])[] = [[]];
    let min_price: number;
    let max_price: number;
    let min_sales: number;
    let max_sales: number;
    let discount_only: boolean;
    let loading: boolean = false;

    $:
    {
        encoded_query = $page.url.searchParams.get('q');
        let temp_min_price: number | null = min_price;
        let temp_max_price: number | null = max_price;
        let temp_min_sales: number | null = min_sales;
        let temp_max_sales: number | null = max_sales;
        let not_discount: number = -1;

        if(temp_min_price === undefined)
        {
            temp_min_price = null;
        }

        if(temp_max_price === undefined)
        {
            temp_max_price = null;
        }

        if(temp_min_sales === undefined)
        {
            temp_min_sales = null;
        }

        if(temp_max_sales === undefined)
        {
            temp_max_sales = null;
        }

        if(discount_only !== undefined && discount_only)
        {
            not_discount = 0;
        }

        init(temp_min_price, temp_max_price, temp_min_sales, temp_max_sales, not_discount);
    }

    function init(min_price: number | null, max_price: number | null, min_sales: number | null, max_sales: number | null, not_discount: number): void
    {
        loading = true;
        timestamp = $now_time;
        let current_timestamp: number = timestamp;

        if(encoded_query === null || encoded_query === undefined)
        {
            goto("/");

            return;
        }

        let query: string = decodeURI(encoded_query);

        if(query.length === 0)
        {
            goto("/");

            return;
        }

        let request_body: any =
        {
            query: query,
            min_price: min_price,
            max_price: max_price,
            min_sales: min_sales,
            max_sales: max_sales,
            not_discount: not_discount
        };

        fetch("/api/get-search-results",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request_body)
        }).then(async (response: Response): Promise<void> =>
        {
            if(timestamp !== current_timestamp)
            {
                return;
            }

            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                let response_products: any[] = response_obj.products;
                products = [];

                for(let i: number = 0; i < Math.ceil(response_products.length / 4); ++i)
                {
                    products.push([]);
                }

                for(let i: number = 0; i < response_products.length; ++i)
                {
                    let new_product: ProductObj =
                    {
                        id: response_products[i].__id,
                        title: response_products[i].__title,
                        rate: response_products[i].__rate,
                        sales: response_products[i].__sales,
                        price: response_products[i].__price,
                        discount: response_products[i].__discount
                    };

                    products[Math.floor(i / 4)].push(new_product);
                }

                loading = false;
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="page-root mt-5">
    <div class="search-filters mx-1">
        <!-- For landscape display -->
        <div class="search-filter-landscape card card-body rounded shadow mb-5">
            <p class="fs-4 fw-semibold gray-700">Filters</p>
            <!-- <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Rate:</p>
            <div class="d-flex align-items-center">
                <div class="mb-3 me-2">
                    <label for="rate-from" class="form-label fw-semibold gray-600">From</label>
                    <input type="number" class="form-control" id="rate-from">
                </div>
                <div class="mb-3">
                    <label for="rate-to" class="form-label fw-semibold gray-600">To</label>
                    <input type="number" class="form-control" id="rate-to">
                </div>
            </div> -->
            <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Price:</p>
            <div class="d-flex align-items-center">
                <div class="mb-3 me-2">
                    <label for="price-from" class="form-label fw-semibold gray-600">From</label>
                    <input bind:value={min_price} type="number" class="form-control" id="price-from">
                </div>
                <div class="mb-3">
                    <label for="price-to" class="form-label fw-semibold gray-600">To</label>
                    <input bind:value={max_price} type="number" class="form-control" id="price-to">
                </div>
            </div>
            <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Sales:</p>
            <div class="d-flex align-items-center">
                <div class="mb-3 me-2">
                    <label for="sales-from" class="form-label fw-semibold gray-600">From</label>
                    <input bind:value={min_sales} type="number" class="form-control" id="sales-from">
                </div>
                <div class="mb-3">
                    <label for="sales-to" class="form-label fw-semibold gray-600">To</label>
                    <input bind:value={max_sales} type="number" class="form-control" id="sales-to">
                </div>
            </div>
            <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Discount:</p>
            <div class="form-check">
                <input bind:checked={discount_only} class="form-check-input" type="checkbox" value="" id="discount-check">
                <label class="form-check-label gray-700" for="discount-check">Show Discount Only</label>
            </div>
            <!-- <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Types:</p>
            <div class="container">
                <div class="row">
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Cosmetics</label>
                    </div>
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Food</label>
                    </div>
                </div>
                <div class="row">
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Shampoo</label>
                    </div>
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Skincare</label>
                    </div>
                </div>
                <div class="row">
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Mothercare</label>
                    </div>
                    <div class="form-check col">
                        <input class="form-check-input" type="checkbox" value="" id="discount-check">
                        <label class="form-check-label gray-700" for="discount-check">Babycare</label>
                    </div>
                </div>
            </div> -->
        </div>
        <!-- For portrait display -->
        <div class="search-filter-portrait card card-body rounded shadow mb-2">
            <div class="d-flex justify-contents-end align-items-center flex-wrap">
                <p class="fs-4 fw-semibold gray-700 flex-fill m-0">Filters</p>
                <a href="#filter-collapse" data-bs-toggle="collapse" class="link-underline link-underline-opacity-0">Show</a>
            </div>
            <div id="filter-collapse" class="collapse">
                <!-- <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Rate:</p>
                <div class="d-flex align-items-center">
                    <div class="mb-3 me-2">
                        <label for="rate-from" class="form-label fw-semibold gray-600">From</label>
                        <input type="number" class="form-control" id="rate-from">
                    </div>
                    <div class="mb-3">
                        <label for="rate-to" class="form-label fw-semibold gray-600">To</label>
                        <input type="number" class="form-control" id="rate-to">
                    </div>
                </div> -->
                <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Price:</p>
                <div class="d-flex align-items-center">
                    <div class="mb-3 me-2">
                        <label for="price-from" class="form-label fw-semibold gray-600">From</label>
                        <input bind:value={min_price} type="number" class="form-control" id="price-from">
                    </div>
                    <div class="mb-3">
                        <label for="price-to" class="form-label fw-semibold gray-600">To</label>
                        <input bind:value={max_price} type="number" class="form-control" id="price-to">
                    </div>
                </div>
                <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Sales:</p>
                <div class="d-flex align-items-center">
                    <div class="mb-3 me-2">
                        <label for="sales-from" class="form-label fw-semibold gray-600">From</label>
                        <input bind:value={min_sales} type="number" class="form-control" id="sales-from">
                    </div>
                    <div class="mb-3">
                        <label for="sales-to" class="form-label fw-semibold gray-600">To</label>
                        <input bind:value={max_sales} type="number" class="form-control" id="sales-to">
                    </div>
                </div>
                <p class="fs-5 fw-semibold gray-600 my-0 pb-1">Discount:</p>
                <div class="form-check">
                    <input bind:checked={discount_only} class="form-check-input" type="checkbox" value="" id="discount-check">
                    <label class="form-check-label gray-700" for="discount-check">Show Discount Only</label>
                </div>
            </div>
        </div>
    </div>
    <!-- search results under this -->
    <div class="results-list">
        <!-- sort -->
        <div class="card card-body rounded shadow d-flex align-items-center justify-content-between flex-row mx-1">
            <p class="fs-4 fw-semibold gray-700 my-0 flex-fill">Search Results</p>
            {#if loading}
                <div transition:fade={{duration: 250}}>
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            {/if}
        </div>
        <!-- result container -->
        <div class="container mt-3">
            {#each products as product_row}
                <div class="row">
                    {#each product_row as product}
                        <div class="product-col col-md p-0 mb-2">
                            <Product id={product.id} />
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .page-root
    {
        margin-left: 10rem;
        margin-right: 10rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .search-filters
    {
        width: 25%;
    }
    .search-filter-portrait
    {
        display: none;
    }
    .search-filter-landscape
    {
        display: block;
    }
    .results-list
    {
        width: 72.5%;
    }
    .product-col
    {
        max-width: 25%;
    }
    @media (max-width: 1199px)
    {
        .search-filters
        {
            width: 100%;
        }
        .search-filter-portrait
        {
            display: block;
        }
        .search-filter-landscape
        {
            display: none;
        }
        .results-list
        {
            width: 100%;
        }
    }
    @media (max-width: 1199px)
    {
        .page-root
        {
            margin-left: 1rem;
            margin-right: 1rem;
        }
    }
    @media (max-width: 768px)
    {
        .product-col
        {
            max-width: 100%;
        }
    }
</style>