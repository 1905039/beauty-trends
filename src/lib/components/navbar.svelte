<script lang="ts">
    import { Dropdown } from "bootstrap";
    import { categories_store, category_dropdown_root_store, logged_in, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { CategoryObj } from "$lib/containers";
    import CategoryNest from "./category-nest.svelte";
    import { respond401 } from "$lib/helpers";

    let category_dropdown_elem: HTMLAnchorElement;
    let search_term: string = "";
    let categories: CategoryObj[] = [];

    function execute_search(): void
    {
        goto("/search?q=" + encodeURI(search_term));
    }

    function logout(): void
    {
        fetch("/api/logout",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                $logged_in = false;

                localStorage.removeItem("checkout-items");
                goto("/");
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
        $category_dropdown_root_store = new Dropdown(category_dropdown_elem);

        fetch("/api/get-categories",
        {
            method: "GET",
            headers:
            {
                "Content-Type": "application/json"
            }
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_json: any = await response.json();
                $categories_store = new Map();

                for(let i: number = 0; i < response_json.categories.length; ++i)
                {
                    let new_category: CategoryObj = new CategoryObj();
                    new_category.id = response_json.categories[i].__id;
                    new_category.title = response_json.categories[i].__title;
                    new_category.parent = response_json.categories[i].__parent;

                    $categories_store.set(new_category.id, new_category);
                }

                categories = [];

                if($categories_store)
                {
                    $categories_store.forEach((value: CategoryObj): void =>
                    {
                        if(value.parent === 0)
                        {
                            categories.push(value);

                            return;
                        }

                        $categories_store?.get(value.parent)?.children.push(value.id);
                    });
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    });
</script>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <!-- svelte-ignore a11y-invalid-attribute -->
    <div class="container-fluid justify-content-between">
        <a class="navbar-brand d-flex" href="/">
            <img class="me-2" src="/logo.webp" alt="logo" width="32px" height="32px" />
            <p class="fs-5 fw-semibold gray-700 my-auto">BeautyTrends</p>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-support-content" aria-controls="navbar-support-content" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbar-support-content">
            <div class="d-flex nav-item mx-auto my-2">
                <div class="btn-group">
                    <a bind:this={category_dropdown_elem} class="nav-link dropdown-toggle my-auto" href="javascript:" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        Categories
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
                <form class="search-input ms-2" on:submit={execute_search} action="javascript:">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search" aria-describedby="button-search" bind:value={search_term}>
                        <button class="btn btn-primary" type="submit" id="button-search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
            <div class="nav-item d-flex justify-content-end my-2">
                {#if $logged_in}
                    <div class="btn-group">
                        <a href="javascript:" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img class="border rounded-circle" src="/person.webp" alt="pfp" height="32px" width="32px" />
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item" href="/profile">Profile</a>
                            </li>
                            <li>
                                <button on:click={logout} class="dropdown-item">Logout</button>
                            </li>
                        </ul>
                    </div>
                {:else}
                    <div class="d-flex flex-row-reverse">
                        <a href="/login" type="button" class="btn btn-primary ms-2">Login</a>
                        <a href="/signup" type="button" class="btn btn-secondary">Signup</a>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</nav>

<style lang="scss">
    
</style>