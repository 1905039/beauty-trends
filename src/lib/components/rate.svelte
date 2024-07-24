<script lang="ts">
    export let rate: number | null;
    export let bold: boolean = false;
</script>

<div class="d-flex align-items-center text-warning">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
    <p class="fs-6 {bold ? "fw-semibold gray-600" : "gray-700"} my-0 ms-1">
        {#if rate === null}
            Unrated
        {:else}
            {rate.toFixed(1)}
        {/if}
    </p>
</div>