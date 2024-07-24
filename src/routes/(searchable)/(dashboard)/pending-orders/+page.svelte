<script lang="ts">
    import { page } from "$app/stores";
    import PendingOrderItem from "$lib/components/pending-order-item.svelte";
    import { dashboard_active_tab_store, pending_order_list_store } from "$lib/stores";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        $dashboard_active_tab_store = ["", "", "active", ""];
        $pending_order_list_store = new Array($page.data.pending_orders.length);

        for(let i: number = 0; i < $pending_order_list_store.length; ++i)
        {
            $pending_order_list_store[i] = $page.data.pending_orders[i].__id;
        }
    });
</script>

<div class="card card-body shadow">
    <p class="fs-3 fw-semibold gray-700 my-auto">Pending Orders</p>
    {#if $pending_order_list_store.length > 0}
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
                        <p class="gray-700 m-0">Verified</p>
                    </th>
                </tr>
            </thead>
            <tbody class="align-middle">
                {#each $pending_order_list_store as id, index}
                    <PendingOrderItem index={index} id={id} />
                {/each}
            </tbody>
        </table>
    {:else}
        <div class="alert alert-secondary mt-2" role="alert">
            Wow! Such empty
        </div>
    {/if}
</div>