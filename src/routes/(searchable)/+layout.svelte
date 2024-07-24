<script lang="ts">
    import Navbar from "$lib/components/navbar.svelte";
    import { respond401 } from "$lib/helpers";
    import { logged_in, unauthorized_toast_store, unknown_error_toast_store, user_id_store } from "$lib/stores";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        $logged_in = false;
        $user_id_store = 0;

        fetch("/api/get-id",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    $logged_in = true;
                    $user_id_store = response_obj.id;
                }
                else
                {
                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }
            }
            else if(response.status === 401)
            {
                if($logged_in)
                {
                    respond401();
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    });
</script>

<Navbar />

<slot></slot>