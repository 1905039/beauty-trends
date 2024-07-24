<script lang="ts">
    import { page } from "$app/stores";
    import { respond401 } from "$lib/helpers";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        if($page.status === 401)
        {
            respond401();
        }
    });
</script>