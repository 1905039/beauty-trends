<script lang="ts">
    import { goto } from "$app/navigation";
    import CheckoutRow from "$lib/components/checkout-row.svelte";
    import type { CartProductObj } from "$lib/containers";
    import { respond401 } from "$lib/helpers";
    import { order_confirm_toast_store, product_unavailable_toast_store, stock_unavailable_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let contact: string;
    let address: string;
    let delivery_charge_start: number;
    let delivery_charge_kg: number;
    let student_discount: number = 0;
    let delivery_charge: number = 0;
    let sub_total_price: number = 0;
    let grand_total_price: number = 0;
    let delivery_charge_ready: boolean = false;
    let total_delivery_charge_ready: boolean = false;
    let student_discount_ready: boolean = false;
    let sub_total_ready: boolean = false;
    let grand_total_ready: boolean;
    let ordering: boolean = false;
    let can_confirm: boolean;
    let checkout_items: CartProductObj[] = [];

    $: can_confirm = checkout_items.length > 0 && !ordering && address !== undefined && address.length > 0 && grand_total_ready;

    function setup_grand_total(): void
    {
        grand_total_ready = student_discount_ready && total_delivery_charge_ready;

        if(grand_total_ready)
        {
            grand_total_price = Math.round(sub_total_price * (1.0 - student_discount / 100.0)) + delivery_charge;
        }
    }

    function setup_subtotal(): void
    {
        sub_total_ready = false;

        for(let i: number = 0; i < checkout_items.length; ++i)
        {
            sub_total_price += checkout_items[i].price * checkout_items[i].quantity;
        }

        sub_total_ready = true;

        setup_delivery_charge();
    }

    function setup_delivery_charge(): void
    {
        if(!(sub_total_ready && delivery_charge_ready))
        {
            return;
        }

        let total_weight: number = 0.0;

        for(let i: number = 0; i < checkout_items.length; ++i)
        {
            total_weight += checkout_items[i].weight;
        }

        delivery_charge = delivery_charge_start;

        if(total_weight > 1.0)
        {
            delivery_charge += Math.ceil(total_weight - 1.0) * delivery_charge_kg;
        }

        total_delivery_charge_ready = true;

        setup_grand_total();
    }

    function get_profile(): void
    {
        fetch("/api/get-profile",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    contact = response_obj.profile.__phone;
                    address = response_obj.profile.__address;
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

    function confirm_order(): void
    {
        ordering = true;
        let products: number[] = new Array(checkout_items.length);
        let quantities: number[] = new Array(checkout_items.length);

        for(let i: number = 0; i < checkout_items.length; ++i)
        {
            products[i] = checkout_items[i].product_id;
            quantities[i] = checkout_items[i].quantity;
        }

        fetch("/api/add-order",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                address: address,
                products: products,
                quantities: quantities,
                sub_total_price: sub_total_price,
                student_discount: student_discount,
                delivery_charge: delivery_charge,
                grand_total_price: grand_total_price
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    if(response_obj.id > 0)
                    {
                        $order_confirm_toast_store?.show();
                        localStorage.removeItem("checkout-items");
                    }
                    else if(response_obj.id === -2)
                    {
                        $product_unavailable_toast_store?.show();
                    }
                    else if(response_obj.id === -3)
                    {
                        $stock_unavailable_toast_store?.show();
                    }
                    else
                    {
                        $unknown_error_toast_store?.show();
                        console.error(response_obj.id);
                    }

                    goto("/");
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

    function get_student_discout(): void
    {
        student_discount_ready = false;

        fetch("/api/get-student-discount",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    if(response_obj.student_discount.__student === 2)
                    {
                        student_discount = Math.round(parseFloat(response_obj.student_discount.__discount) * 100.0);
                    }
                    else
                    {
                        student_discount = 0.0;
                    }

                    student_discount_ready = true;

                    setup_grand_total();
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

    function get_delivery_charge(): void
    {
        delivery_charge_ready = false;

        fetch("/api/get-delivery-charge",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                delivery_charge_start = parseInt(response_obj.__start);
                delivery_charge_kg = parseInt(response_obj.__kg);
                delivery_charge_ready = true;

                setup_delivery_charge();
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    }

    onMount((): void =>
    {
        let temp_checkout_items: string | null = localStorage.getItem("checkout-items");

        if(temp_checkout_items)
        {
            checkout_items = JSON.parse(temp_checkout_items);
        }
        else
        {
            checkout_items = [];
        }

        get_profile();
        get_student_discout();
        get_delivery_charge();
        setup_subtotal();
    });
</script>

<div class="page-root">
    <div class="checkout-card card card-body shadow">
        <p class="fs-3 fw-semibold gray-700 mb-2">Checkout</p>
        <div class="mb-2">
            <label for="contant-input" class="form-label gray-600">Recipient Contact</label>
            <input bind:value={contact} type="tel" class="form-control" id="contant-input">
        </div>
        <div class="mb-4">
            <label for="recipient-address" class="form-label gray-600">Recipient Address</label>
            <textarea bind:value={address} class="form-control" id="recipient-address" rows="3"></textarea>
            <p class="fs-6 gray-600 mb-2">*Will be delivered within 2-3 days</p>
        </div>
        <p class="fs-3 fw-semibold gray-700 mb-2">Products</p>
        <ul class="list-group list-group-flush">
            {#each checkout_items as item, index}
                <CheckoutRow index={index} bind:checkout_items={checkout_items} />
            {/each}
        </ul>
        <div class="d-flex justify-content-between placeholder-glow mt-2">
            <p class="fs-5 gray-700 m-0">Sub Total</p>
            <p class="fs-5 gray-700 m-0">
                {#if sub_total_ready}
                    <span in:fade={{duration: 250}}>৳{sub_total_price}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Student Discount</p>
            <p class="fs-5 gray-700 m-0">
                {#if student_discount_ready}
                    <span in:fade={{duration: 250}}>-{student_discount}%</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Delivery Charge</p>
            <p class="fs-5 gray-700 m-0">
                {#if total_delivery_charge_ready}
                    <span in:fade={{duration: 250}}>৳{delivery_charge}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow mb-2">
            <p class="fs-4 fw-semibold gray-700 m-0">Grand Total</p>
            <p class="fs-4 fw-semibold gray-700 m-0">
                {#if grand_total_ready}
                    <span in:fade={{duration: 250}}>৳{grand_total_price}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-end">
            <button on:click={confirm_order} class="btn btn-success" disabled={!can_confirm}>Confirm</button>
        </div>
    </div>
</div>

<style lang="scss">
    .page-root
    {
        width: 65rem;
        margin-top: 4rem;
        margin-left: auto;
        margin-right: auto;
    }
    .checkout-card
    {
        margin-bottom: 2rem;
    }
    .total-placeholder
    {
        width: 2em;
    }
    @media (max-width: 1099px)
    {
        .page-root
        {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
    @media(max-width: 499px)
    {
        .page-root
        {
            margin-top: 1rem;
        }
    }
</style>