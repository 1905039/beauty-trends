<script lang="ts">
    import { page } from "$app/stores";
    import CompleteOrderItem from "$lib/components/complete-order-item.svelte";
    import { complete_order_list_store, dashboard_active_tab_store, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        $dashboard_active_tab_store = ["", "", "", "active"];
        $complete_order_list_store = new Array($page.data.complete_orders.length);

        for(let i: number = 0; i < $complete_order_list_store.length; ++i)
        {
            $complete_order_list_store[i] = $page.data.complete_orders[i].__id;
        }
    });
</script>
<div class="card card-body shadow">
    <p class="fs-3 fw-semibold gray-700 my-auto">Complete Orders</p>
    {#if $complete_order_list_store.length > 0}
        <table class="table mb-2">
            <thead>
                <tr>
                    <th scope="col">
                        <p class="gray-700 m-0">#</p>
                    </th>
                    <th scope="col">
                        <p class="gray-700 m-0">Order Id</p>
                    </th>
                    <th scope="col">
                        <p class="gray-700 m-0">Issued On</p>
                    </th>
                    <th scope="col">
                        <p class="gray-700 m-0">Status</p>
                    </th>
                </tr>
            </thead>
            <tbody class="align-middle">
                {#each $complete_order_list_store as id, index}
                    <CompleteOrderItem index={index} id={id} />
                {/each}
            </tbody>
        </table>
    {:else}
        <div class="alert alert-secondary mt-2" role="alert">
            Wow! Such empty
        </div>
    {/if}
</div>