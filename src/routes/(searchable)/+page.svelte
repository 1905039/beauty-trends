<script lang="ts">
    import { page } from "$app/stores";
    import RecommendationRow from "$lib/components/recommendation-row.svelte";
    import { unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    class HomeCategory
    {
        public id: number = 0;
        public name: string = "";
        public recommends: number[] = [];
        public show: boolean = false;
    };

    let categories: HomeCategory[] = [];

    onMount((): void =>
    {
        categories = new Array($page.data.categories.length);

        for(let i: number = 0; i < categories.length; ++i)
        {
            categories[i] = new HomeCategory();
            categories[i].id = $page.data.categories[i].metadata.__id;
            categories[i].name = $page.data.categories[i].metadata.__name;
            categories[i].recommends = new Array($page.data.categories[i].recommends.length);

            for(let j: number = 0; j < categories[i].recommends.length; ++j)
            {
                categories[i].recommends[j] = $page.data.categories[i].recommends[j].__id;
            }

            categories[i].show = $page.data.categories[i].show;
        }
    });
</script>

<div class="page-root">
    {#each categories as category}
        <RecommendationRow name={category.name} recommends={category.recommends} show={category.show} />
    {/each}
</div>

<div class="d-flex align-items-center justify-content-between gray-700 border-top py-4 mx-4" in:fade={{duration: 250}}>
    <p class="fs-5 my-0 mx-2">BeautyTrends</p>
    <a class="gray-600 mx-2" href="https://www.facebook.com/profile.php?id=61557181615788">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>
    </a>
</div>

<style lang="scss">
    .page-root
    {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin-top: 4rem;
        padding-left: 1rem;
        padding-right: 1rem;
    }
    @media(max-width: 499px)
    {
        .page-root
        {
            margin-top: 1rem;
        }
    }
</style>