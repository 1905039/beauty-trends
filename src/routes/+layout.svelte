<script lang="ts">
    import "$lib/styles.scss";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { now_time, order_confirm_toast_store, phone_exist_toast_store, product_unavailable_toast_store, stock_unavailable_toast_store, unauthorized_toast_store, unknown_error_toast_store, password_updated_toast_store, old_password_unmatch_toast_store, review_posted_toast_store, copy_clipboard_toast_store } from "$lib/stores";
    import { Toast } from "bootstrap";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let order_confirm_toast_elem: HTMLDivElement;
    let phone_exist_toast_elem: HTMLDivElement;
    let stock_unavailable_toast_elem: HTMLDivElement;
    let product_unavailable_toast_elem: HTMLDivElement;
    let unauthorized_toast_elem: HTMLDivElement;
    let unknown_error_toast_elem: HTMLDivElement;
    let password_updated_toast_elem: HTMLDivElement;
    let old_password_unmatch_toast_elem: HTMLDivElement;
    let review_posted_toast_elem: HTMLDivElement;
    let copy_clipboard_toast_elem: HTMLDivElement;
    let navigating: boolean = true;

    beforeNavigate((): void =>
    {
        navigating = true;
    });

    afterNavigate((): void =>
    {
        navigating = false;
    });

    onMount((): void =>
    {
        $order_confirm_toast_store = new Toast(order_confirm_toast_elem);
        $phone_exist_toast_store = new Toast(phone_exist_toast_elem);
        $stock_unavailable_toast_store = new Toast(stock_unavailable_toast_elem);
        $product_unavailable_toast_store = new Toast(product_unavailable_toast_elem);
        $unauthorized_toast_store = new Toast(unauthorized_toast_elem);
        $unknown_error_toast_store = new Toast(unknown_error_toast_elem);
        $password_updated_toast_store = new Toast(password_updated_toast_elem);
        $old_password_unmatch_toast_store = new Toast(old_password_unmatch_toast_elem);
        $review_posted_toast_store = new Toast(review_posted_toast_elem);
        $copy_clipboard_toast_store = new Toast(copy_clipboard_toast_elem);

        setInterval((): void =>
        {
            $now_time = Date.now();
        }, 1000);
    });
</script>

<div class="site-root">
    <slot></slot>
</div>

{#if navigating}
    <div class="navigation-progress progress" transition:fade={{duration: 250}}>
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>
    </div>
{/if}

<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div bind:this={order_confirm_toast_elem} class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Order confirmed
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={phone_exist_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Phone number already exists
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={stock_unavailable_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Stock unavailable
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={product_unavailable_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Product unavailable
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={unauthorized_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Could not authorize
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={unknown_error_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Error
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={password_updated_toast_elem} class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Password updated
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={old_password_unmatch_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Old password is incorrect
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={review_posted_toast_elem} class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Review posted
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={copy_clipboard_toast_elem} class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Link copied to clipboard
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<style lang="scss">
    .navigation-progress
    {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        height: 0.25rem;
    }
    .site-root
    {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
    }
</style>