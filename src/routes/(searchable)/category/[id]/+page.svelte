<script lang="ts">
    import Product from "$lib/components/product.svelte";
    import { page } from "$app/stores";
    import { CategoryObj, ProductObj } from "$lib/containers";
    import { categories_store, now_time, unknown_error_toast_store } from "$lib/stores";
    import NameAsc from "$lib/components/category-sort/name-asc.svelte";
    import NameDesc from "$lib/components/category-sort/name-desc.svelte";
    import PriceAsc from "$lib/components/category-sort/price-asc.svelte";
    import PriceDesc from "$lib/components/category-sort/price-desc.svelte";
    import { Collapse } from "bootstrap";
    import { fade } from "svelte/transition";

    let timestamp: number;
    let category_name: string = "";
    let category_id: number;
    let category_chain: string[] = [];
    let category_products: ProductObj[][] = [];
    // sort_by
    // 0 -> name asc
    // 1 -> name desc
    // 2 -> price asc
    // 3 -> price desc
    let sort_by: number = 0;
    let min_price: number;
    let max_price: number;
    let min_sales: number;
    let max_sales: number;
    let discount_only: boolean;
    let loading: boolean = false;

    $:
    {
        category_id = parseInt($page.params.id);
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

        init(sort_by, temp_min_price, temp_max_price, temp_min_sales, temp_max_sales, not_discount);
    }
    $: setup_category_chain(category_id, $categories_store);

    function setup_category_chain(current_id: number, categories: Map<number, CategoryObj> | null): void
    {
        if(categories === null)
        {
            return;
        }

        category_chain = [];

        while(current_id !== 0)
        {
            let category_obj: CategoryObj | undefined = categories.get(current_id);

            if(category_obj)
            {
                category_chain.push(category_obj.title);

                current_id = category_obj.parent;
            }
            else
            {
                current_id = 0;
            }
        }

        category_chain.reverse();
    }

    function init(sort_by: number, min_price: number | null, max_price: number | null, min_sales: number | null, max_sales: number | null, not_discount: number): void
    {
        loading = true;
        timestamp = $now_time;
        let current_timestamp: number = timestamp;
        let temp_category_name: string | undefined = $categories_store?.get(category_id)?.title;

        if(temp_category_name !== undefined)
        {
            category_name = temp_category_name;
        }

        let request_body: any =
        {
            id: category_id,
            sort_by: sort_by,
            min_price: min_price,
            max_price: max_price,
            min_sales: min_sales,
            max_sales: max_sales,
            not_discount: not_discount
        };

        fetch("/api/get-products-by-category",
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
                category_products = [];

                for(let i: number = 0; i < Math.ceil(response_products.length / 4); ++i)
                {
                    category_products.push([]);
                }

                for(let i: number = 0; i < response_products.length; ++i)
                {
                    let new_product: ProductObj = new ProductObj();
                    new_product.id = response_products[i].__id;

                    category_products[Math.floor(i / 4)].push(new_product);
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
<div class="page-root flex mt-5">
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
    <div class="results-list">
        <div class="card rounded shadow mx-1">
            <div class="card-body d-flex flex-wrap justify-content-between align-items-center flex-wrap">
                <div class="breadcrumb d-flex flex-col align-items-center my-0">
                    {#each category_chain as category}
                        <div class="breadcrumb-item d-flex align-items-center">
                            <p class="fs-4 fw-semibold gray-700 my-0">{category}</p>
                        </div>
                    {/each}
                </div>
                <div class="d-flex align-items-center">
                    {#if loading}
                        <div class="me-2" transition:fade={{duration: 250}}>
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    {/if}
                    <button type="button" class="btn btn-outline-primary my-auto" data-bs-toggle="dropdown" aria-expanded="false">
                        {#if sort_by === 0}
                            <NameAsc />
                        {:else if sort_by === 1}
                            <NameDesc />
                        {:else if sort_by === 2}
                            <PriceAsc />
                        {:else if sort_by === 3}
                            <PriceDesc />
                        {/if}
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <button on:click={() => {sort_by = 0}} class="dropdown-item d-flex justify-content-between align-items-center">
                                <NameAsc />
                            </button>
                        </li>
                        <li>
                            <button on:click={() => {sort_by = 1}} class="dropdown-item d-flex justify-content-between align-items-center">
                                <NameDesc />
                            </button>
                        </li>
                        <li>
                            <button on:click={() => {sort_by = 2}} class="dropdown-item d-flex justify-content-between align-items-center">
                                <PriceAsc />
                            </button>
                        </li>
                        <li>
                            <button on:click={() => {sort_by = 3}} class="dropdown-item d-flex justify-content-between align-items-center">
                                <PriceDesc />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="container my-3">
            {#each category_products as product_row}
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