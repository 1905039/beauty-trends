<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import OrderProductRow from "$lib/components/order-product-row.svelte";
    import { OrderProductObj } from "$lib/containers";
    import { respond401 } from "$lib/helpers";
    import { order_products_store, pending_order_list_store, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let id: number;
    let status: number;
    let contact: string;
    let address: string;
    let verified: boolean = false;
    let paid: boolean;
    let issued_on: Date;
    let date_text: string;
    let time_text: string;
    let sub_total_price: number;
    let student_discount: number;
    let delivery_charge: number;
    let grand_total_price: number;
    let cancelable: boolean;
    let cancelling: boolean = false;
    let data_loaded: boolean = false;

    $: date_text = issued_on?.toLocaleDateString();
    $: time_text = issued_on?.toLocaleTimeString();
    $: cancelable = !cancelling && status === 1;

    function cancel(): void
    {
        fetch("/api/cancel-pending-order",
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
                $pending_order_list_store = [];

                goto("/pending-orders");
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

    onMount((): void =>
    {
        $order_products_store = [];
        cancelling = false;
        id = parseInt($page.params.id);

        fetch("/api/get-order-data",
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
                    status = response_obj.data.__status;
                    contact = response_obj.data.__contact;
                    address = response_obj.data.__address;
                    verified = response_obj.data.__verified;
                    paid = response_obj.data.__paid;
                    issued_on = new Date(response_obj.data.__issued_on)
                    sub_total_price = response_obj.data.__sub_total_price;
                    student_discount = response_obj.data.__student_discount;
                    delivery_charge = response_obj.data.__delivery_charge;
                    grand_total_price = response_obj.data.__grand_total_price;
                    data_loaded = true;
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

        fetch("/api/get-order-products",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json",
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
                let temp_order_products_store: OrderProductObj[] = new Array(response_obj.products.length);

                for(let i: number = 0; i < temp_order_products_store.length; ++i)
                {
                    temp_order_products_store[i] = new OrderProductObj();
                    temp_order_products_store[i].id = response_obj.products[i].__id;
                }

                $order_products_store = temp_order_products_store;
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

<div class="order-root">
    <div class="order-card card card-body placeholder-glow shadow">
        <p class="fs-3 fw-semibold gray-700">Order Details</p>
        <div class="container">
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Order ID</p>
                    {#if data_loaded}
                        <p class="fs-4 fw-semibold gray-700" in:fade={{duration: 250}}>{id}</p>
                    {:else}
                        <p class="fs-4 gray-500">
                            <span class="placeholder col-2"></span>
                        </p>
                    {/if}
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Status</p>
                    {#if data_loaded}
                        <p class="fs-4 fw-semibold gray-700" in:fade={{duration: 250}}>
                            {#if status === 0}
                                Cancelled
                            {:else if status === 1}
                                Delivering
                            {:else if status === 2}
                                Delivered
                            <!-- unlikely case -->
                            {:else}
                                Unknown
                            {/if}
                        </p>
                    {:else}
                        <p class="fs-4 gray-600">
                            <span class="placeholder col-3"></span>
                        </p>
                    {/if}
                </div>
            </div>
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Contact</p>
                    {#if data_loaded}
                        <p class="fs-4 fw-semibold gray-700" in:fade={{duration: 250}}>{contact}</p>
                    {:else}
                        <p class="fs-4 gray-500">
                            <span class="placeholder col-5"></span>
                        </p>
                    {/if}
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Issued On</p>
                    {#if data_loaded}
                        <p class="fs-4 fw-semibold gray-700" in:fade={{duration: 250}}>
                            <span>{date_text}</span>
                            <span>{time_text}</span>
                        </p>
                    {:else}
                        <p class="fs-4 gray-500">
                            <span class="placeholder col-3"></span>
                            <span class="placeholder col-3"></span>
                        </p>
                    {/if}
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Verified</p>
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-600 my-0">Paid</p>
                </div>
            </div>
            {#if data_loaded}
                <div class="row" in:fade={{duration: 250}}>
                    <div class="col p-0">
                        {#if verified}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check text-success" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                                <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban text-danger" viewBox="0 0 16 16">
                                <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                            </svg>
                        {/if}
                    </div>
                    <div class="col p-0">
                        {#if paid}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check text-success" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                                <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban text-danger" viewBox="0 0 16 16">
                                <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                            </svg>
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="row">
                    <div class="col p-0">
                        <span class="placeholder col-1 gray-500"></span>
                    </div>
                    <div class="col p-0">
                        <span class="placeholder col-1 gray-500"></span>
                    </div>
                </div>
            {/if}
        </div>
        <p class="fs-5 fw-semibold gray-600 mt-3 mb-0">Address</p>
        {#if data_loaded}
            <p class="fs-4 fw-semibold gray-700 mb-4" in:fade={{duration: 250}}>{address}</p>
        {:else}
            <p class="fs-4 m-0 gray-500">
                <span class="placeholder col-4"></span>
                <span class="placeholder col-2"></span>
            </p>
            <p class="fs-4 gray-500 mb-4">
                <span class="placeholder col-2"></span>
                <span class="placeholder col-5"></span>
                <span class="placeholder col-1"></span>
            </p>
        {/if}
        <p class="fs-3 fw-semibold gray-700 my-0">Products</p>
        <ul class="list-group list-group-flush">
            {#each $order_products_store as item, index}
                <OrderProductRow index={index} id={item.id} />
            {/each}
        </ul>
        <div class="d-flex justify-content-between placeholder-glow mt-2">
            <p class="fs-5 gray-700 m-0">Sub Total</p>
            <p class="fs-5 gray-700 m-0">
                {#if data_loaded}
                    <span in:fade={{duration: 250}}>৳{sub_total_price}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Student Discount</p>
            <p class="fs-5 gray-700 m-0">
                {#if data_loaded}
                    <span in:fade={{duration: 250}}>-{student_discount}%</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Delivery Charge</p>
            <p class="fs-5 gray-700 m-0">
                {#if data_loaded}
                    <span in:fade={{duration: 250}}>৳{delivery_charge}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow mb-2">
            <p class="fs-4 fw-semibold gray-700 m-0">Grand Total</p>
            <p class="fs-4 fw-semibold gray-700 m-0">
                {#if data_loaded}
                    <span in:fade={{duration: 250}}>৳{grand_total_price}</span>
                {:else}
                    <span class="placeholder total-placeholder"></span>
                {/if}
            </p>
        </div>
        <div class="d-flex justify-content-end">
            {#if data_loaded && !verified}
                <button on:click={cancel} class="btn btn-danger d-flex align-items-center" disabled={!cancelable} in:fade={{duration: 250}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg me-1" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                    Cancel Order
                </button>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .order-root
    {
        margin-top: 4rem;
        width: 65rem;
        margin-left: auto;
        margin-right: auto;
    }
    .order-card
    {
        margin-bottom: 2rem;
    }
    @media(max-width: 1099px)
    {
        .order-root
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
        .order-root
        {
            margin-top: 1rem;
        }
    }
</style>