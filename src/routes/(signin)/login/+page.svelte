<script lang="ts">
    import { goto } from "$app/navigation";
    import { logged_in, unknown_error_toast_store } from "$lib/stores";
    import { Toast } from "bootstrap";
    import { onMount } from "svelte";

    let phone: string;
    let password: string;
    let login_form: HTMLFormElement;
    let loggin_in: boolean = false;
    let loggin_error: boolean = false;
    let error_message: string = "";
    let error_toast_elem: HTMLDivElement;
    let error_toast: Toast;

    function submit_login()
    {
        loggin_in = true;

        fetch("/api/login",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
            {
                phone: phone,
                password: password
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === -2)
                {
                    error_message = "User Not Found";
                }
                else if(response_obj.success === -3)
                {
                    error_message = "Wrong Password";
                }
                else if(response_obj.success === -1)
                {
                    error_message = "Unknown Error";
                }

                if(response_obj.success === 0)
                {
                    $logged_in = true;

                    goto("/");
                }
                else
                {
                    loggin_error = true;

                    error_toast.show();
                }

                loggin_in = false;
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });

        login_form.reset();
    }

    onMount((): void =>
    {
        error_toast = new Toast(error_toast_elem);
    });
</script>

<p class="fs-3 fw-semibold gray-700">Login</p>
{#if loggin_in}
    <div class="d-flex ">
        <p class="fs-5 gray-700 me-2">Loggin In...</p>
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
{:else}
    <form bind:this={login_form} on:submit={submit_login}>
        <div class="form-floating mb-2">
            <input bind:value={phone} type="tel" class="form-control" id="login-phone" placeholder="">
            <label for="login-phone">Contact</label>
        </div>
        <div class="col form-floating p-0">
            <input bind:value={password} type="password" class="form-control" id="login-password" placeholder="">
            <label for="login-password">Password</label>
        </div>
        <p class="gray-700 fs-6">
            New User?
            <a href="/signup" class="link-underline link-underline-opacity-0">Signup</a>
        </p>
        <div class="d-flex justify-content-between align-items-center">
            <a href="/" class="fs-6 link-underline link-underline-opacity-0 me-2">Home</a>
            <button type="submit" class="btn btn-success">Login</button>
        </div>
    </form>
{/if}

<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div bind:this={error_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                {error_message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
</div>