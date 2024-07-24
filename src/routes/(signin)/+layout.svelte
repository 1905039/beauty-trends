<script lang="ts">
    import { unknown_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let image_loaded: boolean = false;
    let image_data: string;

    onMount((): void =>
    {
        fetch("/cosmetics.webp",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                image_data = URL.createObjectURL(await response.blob());
                image_loaded = true;
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    });
</script>

<div class="signin-root d-flex align-items-center justify-content-between flex-wrap">
    {#if image_loaded}
        <img class="signin-img shadow rounded" src={image_data} alt="signin-alt" in:fade={{duration: 250}} />
    {:else}
        <div></div>
    {/if}
    <div class="signin-card d-flex flex-column align-items-center">
        <p class="fs-2 fw-semibold gray-700">BeautyTrends</p>
        <div class="card card-body shadow align-self-stretch">
            <slot></slot>
        </div>
    </div>
</div>

<style lang="scss">
    .signin-root
    {
        position: absolute;
        top: 5rem;
        bottom: 5rem;
        left: 15%;
        right: 15%;
    }
    .signin-img
    {
        max-height: 100%;
        max-width: 50%;
        object-fit: scale-down;
    }
    .signin-card
    {
        width: 40%;
        height: fit-content;
    }
    @media(max-width: 1279px)
    {
        .signin-root
        {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .signin-img
        {
            display: none;
        }
        .signin-card
        {
            width: 100%;
            margin-left: 1rem;
            margin-right: 1rem;
            height: fit-content;
        }
    }
</style>