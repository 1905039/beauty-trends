<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import CartProduct from "$lib/components/cart-product.svelte";
    import { CartProductObj } from "$lib/containers";
    import { cart_items_store, dashboard_active_tab_store } from "$lib/stores";
    import { onMount } from "svelte";

    let can_checkout: boolean;

    $: can_checkout = $cart_items_store.length > 0;

    function get_cart_items(): void
    {
        $cart_items_store = new Array($page.data.cart_items.length);

        for(let i: number = 0; i < $cart_items_store.length; ++i)
        {
            $cart_items_store[i] = new CartProductObj();
            $cart_items_store[i].id = $page.data.cart_items[i].__id;
        }
    }

    function checkout(): void
    {
        localStorage.setItem("checkout-items", JSON.stringify($cart_items_store));
        goto("/checkout");
    }

    onMount((): void =>
    {
        $dashboard_active_tab_store = ["", "active", "", ""];

        get_cart_items();
    });
</script>
<div class="card card-body shadow d-flex flex-row justify-content-between">
    <p class="fs-3 fw-semibold gray-700 my-auto">Cart</p>
    <button class="btn btn-outline-primary" type="button">
        <span>Name</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-alpha-down" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371zm1.57-.785L11 2.687h-.047l-.652 2.157z"/>
            <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z"/>
        </svg>
    </button>
</div>
<ul class="p-0 mt-4 mb-0 pb-4">
    {#each $cart_items_store as cart_item, index}
        <li class="list-group-item mb-2">
            <CartProduct index={index} id={cart_item.id} />
        </li>
    {/each}
</ul>
<div class="d-flex justify-content-end">
    <button on:click={checkout} type="button" class="btn btn-primary d-flex align-items-center" disabled={!can_checkout}>Checkout</button>
</div>