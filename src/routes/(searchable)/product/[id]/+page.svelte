<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { copy_clipboard_toast_store, logged_in, product_image_bucket, review_posted_toast_store, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { Toast } from "bootstrap";
    import { CartProductObj, ImageData, Review } from "$lib/containers";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    import RateInput from "$lib/components/rate-input.svelte";
    import ReviewCard from "$lib/components/review-card.svelte";
    import Rate from "$lib/components/rate.svelte";
    import { respond401 } from "$lib/helpers";

    let id: number;
    let title: string;
    let rate: number | null;
    let sales: number;
    let quantity: number;
    let price: number;
    let discount: number;
    let description: string;
    let final_price: number;
    let add_to_cart_quantity: number = 1;
    let rate_input: number;
    let review_text: string;
    let adding_to_cart: boolean = false;
    let review_form_elem: HTMLFormElement;
    let add_success_toast_elem: HTMLDivElement;
    let add_fail_toast_elem: HTMLDivElement;
    let quantity_elem: HTMLInputElement;
    let add_success_toast: Toast;
    let add_fail_toast: Toast;
    let show_og_price: boolean;
    let buyable: boolean;
    let data_loaded: boolean = false;
    let image_loaded: boolean;
    let images_data: ImageData[] = [];
    let reviews: Review[] = [];
    let current_image_index: number = 0;
    let can_review: boolean = false;
    let image_list_loaded: boolean = false;
    let posting_review: boolean = false;
    let post_disabled: boolean;
    let owned: boolean = false;
    let deleted: boolean = false;

    $: show_og_price = discount > 0.0 && final_price !== price;
    $: buyable = quantity > 0 && $logged_in && !adding_to_cart && !deleted;
    $: image_loaded = images_data.length > 0 && images_data[current_image_index] !== undefined && images_data[current_image_index] !== null && images_data[current_image_index].loaded;
    $: post_disabled = rate_input === 0 || posting_review;

    function share(): void
    {
        navigator.clipboard.writeText($page.url.href).then((): void =>
        {
            $copy_clipboard_toast_store?.show();
        });
    }

    function get_product_data(): void
    {
        let request_body: any = {id: id};

        fetch("/api/get-product-data",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request_body)
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                let data: any = response_obj.data;
                id = data.__id;
                title = data.__title;
                rate = data.__rate;
                quantity = data.__quantity;
                sales = data.__sales;
                rate = data.__rate;
                discount = data.__discount;
                price = data.__price;
                final_price = Math.round(price * (1 - discount));
                description = data.__description;
                deleted = data.__deleted;
                data_loaded = true;
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });

        image_list_loaded = false;

        fetch("/api/get-product-images",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                images_data = new Array(response_obj.images.length);

                for(let i: number = 0; i < images_data.length; ++i)
                {
                    images_data[i] = new ImageData();
                    images_data[i].id = response_obj.images[i].__id;
                }

                image_list_loaded = true;

                for(let i: number = 0; i < images_data.length; ++i)
                {
                    let response: Response = await fetch(product_image_bucket + id + "-" + images_data[i].id + ".webp",
                    {
                        method: "GET"
                    });
                    images_data[i].data = URL.createObjectURL(await response.blob());
                    images_data[i].loaded = true;
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });

        can_review = false;

        fetch("/api/get-can-review",
        {
            method: "POST",
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
                    can_review = true;
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    }

    function add_to_cart(): void
    {
        adding_to_cart = true;

        fetch("/api/add-to-cart",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                product_id: id,
                quantity: add_to_cart_quantity
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    if(response_obj.added === true)
                    {
                        add_success_toast.show();
                    }
                    else
                    {
                        add_fail_toast.show();
                    }
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

            adding_to_cart = false;
            add_to_cart_quantity = 1;
        });
    }

    function buy(): void
    {
        let new_checkout_item: CartProductObj = new CartProductObj();
        new_checkout_item.id = 0;
        new_checkout_item.product_id = id;
        new_checkout_item.name = title;
        new_checkout_item.quantity = add_to_cart_quantity;
        new_checkout_item.price = final_price;

        localStorage.setItem("checkout-items", JSON.stringify([new_checkout_item]));

        goto("/checkout");
    }

    function next_image(): void
    {
        ++current_image_index;
        
        if(current_image_index >= images_data.length)
        {
            current_image_index = 0;
        }
    }

    function previous_image(): void
    {
        --current_image_index;

        if(current_image_index < 0)
        {
            current_image_index = images_data.length - 1;
        }
    }

    function submit_review(): void
    {
        posting_review = true;
        let temp_review: string | null | undefined = review_text;

        if(temp_review === null || temp_review === undefined)
        {
            temp_review = "";
        }

        fetch("/api/add-review",
        {
            method: "POST",
            body: JSON.stringify(
            {
                product_id: id,
                rate: rate_input,
                review: temp_review
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    can_review = false;

                    get_reviews();
                    $review_posted_toast_store?.show();
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

            review_form_elem.reset();

            rate_input = 0;
            posting_review = false;
        });
    }

    function get_reviews(): void
    {
        fetch("/api/get-reviews",
        {
            method: "POST",
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
                    owned = response_obj.owned;
                    reviews = new Array(response_obj.reviews.length);

                    for(let i: number = 0; i < reviews.length; ++i)
                    {
                        reviews[i] = new Review();
                        reviews[i].id = response_obj.reviews[i].__id;
                    }
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

    onMount(async (): Promise<void> =>
    {
        add_success_toast = new Toast(add_success_toast_elem);
        add_fail_toast = new Toast(add_fail_toast_elem);
        id = parseInt($page.params.id);

        get_product_data();
        get_reviews();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="details-root">
    <div class="details-card card card-body placeholder-glow shadow">
        <div class="left-details d-flex align-items-center justify-content-center">
            <button on:click={previous_image} class="btn btn-link link-secondary btn-sm" disabled={!image_list_loaded}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                </svg>
            </button>
            {#if data_loaded && image_loaded}
                <img src={images_data[current_image_index].data} class="product-img rounded img-fuild mx-1" alt="product-img" in:fade={{duration: 250}} />
            {:else}
                <span class="product-img rounded placeholder gray-500 mx-1"></span>
            {/if}
            <button on:click={next_image} class="btn btn-link link-secondary btn-sm" disabled={!image_list_loaded}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                </svg>
            </button>
        </div>
        <div class="right-details align-self-stretch d-flex flex-column justify-content-between">
            {#if data_loaded}
                <div in:fade={{duration: 250}}>
                    <p class="fs-1 fw-semibold gray-700 mb-1">{title}</p>
                    <div class="d-flex">
                        <p class="fs-4 fw-semibold orange-500 my-0 me-2">
                            ৳{final_price}
                        </p>
                        {#if show_og_price}
                            <p class="fs-4 fw-semibold gray-500 text-decoration-line-through my-0">৳ {price}</p>
                        {/if}
                    </div>
                    <div class="d-flex">
                        <p class="fs-6 fw-semibold gray-600 my-0">{quantity} Remaining • {sales} Sold</p>
                    </div>
                    <Rate rate={rate} bold={true} />
                    <div class="my-2">
                        <a on:click={share} class="share-button" href="javascript:" role="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-share-fill" viewBox="0 0 16 16">
                                <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5"/>
                            </svg>
                        </a>
                    </div>
                    {#if description !== null && description !== undefined && description.length > 0}
                        <div class="mb-2">
                            <p class="fs-4 fw-semibold gray-700 mb-1">Description:</p>
                            <p class="fs-5 fw-semibold gray-600">{description}</p>
                        </div>   
                    {/if}
                </div>
                <div class="d-flex justify-content-end align-items-center" in:fade={{duration: 250}}>
                    {#if deleted}
                        <p class="fs-5 my-0 text-danger">Deleted Product</p>
                    {:else}
                        {#if !$logged_in}
                            <a href="javascript:" title="Login to add to cart or buy">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle gray-600 me-2" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                </svg>
                            </a>
                        {/if}
                        <input bind:this={quantity_elem} bind:value={add_to_cart_quantity} type="number" class="form-control flex-shrink me-2" placeholder="0" min="1" max={quantity} disabled={!buyable} style="max-width: 4em;">
                        <button on:click={add_to_cart} type="button" class="btn btn-secondary me-2" disabled={!buyable}>Add to Cart</button>
                        <button on:click={buy} type="button" class="btn btn-primary" disabled={!buyable}>Buy Now</button>
                    {/if}
                </div>
            {:else}
                <div>
                    <p class="fs-1 fw-semibold gray-500 mb-1">
                        <span class="placeholder col-3"></span>
                    </p>
                    <p class="flex-grow fs-4 fw-semibold gray-500 my-0 me-2">
                        <span class="placeholder col-2"></span>
                    </p>
                    <p class="fs-6 fw-semibold gray-500">
                        <span class="placeholder col-1"></span>
                        <span class="placeholder col-2"></span>
                    </p>
                </div>
            {/if}
        </div>
    </div>
    {#if can_review}
        <form bind:this={review_form_elem} on:submit={submit_review} class="card card-body placeholder-glow shadow mt-4" action="javascript:">
            <p class="fs-3 fw-semibold gray-700">Write a Review</p>
            <textarea bind:value={review_text} class="form-control" rows="3" placeholder="Tell us how you feel..." autocomplete="off"></textarea>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <RateInput bind:rate={rate_input} />
                <button type="submit" class="btn btn-success" disabled={post_disabled}>Post</button>
            </div>
        </form>
    {/if}
    {#if reviews.length > 0}
        <div class="mt-4" in:fade={{duration: 250}}>
            <p class="fs-3 fw-semibold gray-700 m-0">Reviews</p>
        </div>
        <div class="mb-4">
            {#each reviews as review, index}
                <ReviewCard id={review.id} index={index} owned={owned} parent_reload={get_reviews} bind:parent_can_review={can_review} />
            {/each}
        </div>
    {/if}
</div>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div bind:this={add_success_toast_elem} class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Added to cart
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={add_fail_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Cannot add any more
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<style lang="scss">
    .details-root
    {
        width: 65rem;
        margin-top: 4rem;
        margin-left: auto;
        margin-right: auto;
    }
    .details-card
    {
        display: flex;
        flex-direction: row;
        align-items: start;
    }
    .left-details
    {
        width: fit-content;
    }
    .right-details
    {
        width: 75%;
        padding-left: 2em;
    }
    .product-img
    {
        width: 256px;
        height: 256px;
    }
    .share-button
    {
        color: #0D6EFD;
    }
    @media (max-width: 1099px)
    {
        .details-root
        {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
    @media(max-width: 749px)
    {
        .details-card
        {
            display: block;
        }
        .left-details
        {
            width: 100%;
            margin-bottom: 1rem;
        }
        .product-img
        {
            width: 100%;
            height: 100%;
            aspect-ratio: 1;
        }
        .right-details
        {
            width: 100%;
            padding-left: 0;
        }
    }
    @media(max-width: 499px)
    {
        .details-root
        {
            margin-top: 1rem;
        }
    }
</style>