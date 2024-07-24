<script lang="ts">
    import CategoryNest from "./category-nest.svelte";
    import type { CategoryObj } from "$lib/containers";
    import { categories_store, category_dropdown_root_store } from "$lib/stores";
    import { onMount } from "svelte";

    export let name: string;
    export let category_indices: number[];
    let categories: CategoryObj[] = [];

    onMount((): void =>
    {
        categories = [];

        category_indices.forEach((value: number): void =>
        {
            let category: CategoryObj | undefined = $categories_store?.get(value);

            if(category === undefined)
            {
                return;
            }

            categories.push(category);
        });
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="dropend">
    <a class="dropdown-item dropdown-toggle my-auto" href="javascript:" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
        {name}
    </a>
    <ul class="dropdown-menu">
        {#each categories as category}
            <li>
                {#if category.children.length === 0}
                    <a on:click={() => {$category_dropdown_root_store?.toggle()}} class="dropdown-item" href="/category/{category.id}">{category.title}</a>
                {:else}
                    <CategoryNest name={category.title} category_indices={category.children} />
                {/if}
            </li>
        {/each}
    </ul>
</div>