<script lang="ts">
    import { goto } from "$app/navigation";
    import { logged_in, now_time, unknown_error_toast_store } from "$lib/stores";
    import { Toast } from "bootstrap";
    import { onMount } from 'svelte';

    let state: number = 0;
    let signin_form: HTMLFormElement;
    let otp_form: HTMLFormElement;
    let password_confirm_elem: HTMLInputElement;
    let otp_value: string;
    let user_name: string;
    let phone: string;
    let password: string;
    let password_confirm: string;
    let error_message: string = "";
    let error_toast_elem: HTMLDivElement;
    let error_toast: Toast;
    let start_time: Date;
    let time_text: string;

    function update_timer(now_time: number): void
    {
        if(!(start_time === undefined || start_time === null))
        {
            let diff: number = (now_time - start_time.getTime());

            if(diff < 0)
            {
                diff = 0;
            }

            if(diff > 120000)
            {
                time_text = "Time up";
            }
            else
            {
                diff /= 1000;
                diff = Math.round(diff);
                time_text = `Remaining ${(Math.floor((120 - diff) / 60)).toString().padStart(2, "0")}:${((120 - diff) % 60).toString().padStart(2, "0")}`;
            }
        }
    }

    $:
    {
        update_timer($now_time);
    }

    function reset(): void
    {
        otp_value = "";
        phone = "";
        password = "";
        password_confirm = "";
    }

    function issue_otp(): void
    {
        fetch("/api/issue-otp",
        {
            method: "PUT",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                phone: phone
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj === null || response_obj === undefined)
                {
                    error_message = "Unknown error";
                    state = 0;

                    error_toast.show();
                }
                else
                {
                    if(response_obj.success == 0)
                    {
                        state = 2;
                        start_time = new Date(response_obj.start_time);

                        update_timer($now_time);
                    }
                    else
                    {
                        if(response_obj.success == -2)
                        {
                            error_message = "User already signed up";
                        }
                        else
                        {
                            error_message = "Unknown error";
                        }

                        state = 0;

                        error_toast.show();
                    }
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    }

    function signup(): void
    {
        let temp_name: string | null | undefined = user_name;

        if(temp_name === null || temp_name === undefined)
        {
            temp_name = "";
        }

        fetch("/api/signup",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
            {
                user_name: temp_name,
                phone: phone,
                password: password,
                otp: otp_value
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj === null || response_obj === undefined)
                {
                    error_message = "Unknown error";
                    state = 0;

                    error_toast.show();
                }
                else
                {
                    if(response_obj.success > 0)
                    {
                        $logged_in = true;

                        goto("/");
                    }
                    else
                    {
                        if(response_obj.success == 0)
                        {
                            error_message = "User already signed up";
                        }
                        else if(response_obj.success == -1)
                        {
                            error_message = "Could not verify OTP";
                        }
                        else if(response_obj.success == -2)
                        {
                            error_message = "OTP timed out";
                        }
                        else
                        {
                            error_message = "Unknown error";
                        }

                        state = 0;

                        error_toast.show();
                    }
                }
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });

        reset();
    }

    function next(): void
    {
        state = 1;

        if(password !== password_confirm)
        {
            password_confirm_elem.setCustomValidity("Password does not match");

            return;
        }

        issue_otp();
    }

    function back(): void
    {
        state = 0;
    }

    onMount((): void =>
    {
        error_toast = new Toast(error_toast_elem);
    });
</script>

<p class="fs-3 fw-semibold gray-700">Signup</p>
{#if state === 0}
    <form bind:this={signin_form} on:submit={next}>
        <div class="form-floating mb-2">
            <input bind:value={user_name} type="text" class="form-control" id="signup-name" placeholder="" autocomplete="off">
            <label for="signup-name">Name</label>
        </div>
        <div class="form-floating mb-2">
            <input bind:value={phone} type="tel" class="form-control" id="signup-phone" placeholder="" autocomplete="off" required>
            <label for="signup-phone">Contact</label>
        </div>
        <div class="password-container-parent">
            <div class="password-container password-container-left col form-floating mb-2">
                <input bind:value={password} type="password" class="form-control" id="signup-password" minlength="8" placeholder="" required>
                <label for="signup-password">Password</label>
            </div>
            <div class="password-container password-container-right col form-floating mb-2">
                <input bind:this={password_confirm_elem} bind:value={password_confirm} type="password" class="form-control" id="signup-password-confirm" minlength="8" placeholder="" required>
                <label for="signup-password-confirm">Confirm Password</label>
            </div>
        </div>
        <p class="gray-700 fs-6 mb-2">
            Already a User?
            <a href="/login" class="link-underline link-underline-opacity-0">Login</a>
        </p>
        <div class="d-flex justify-content-between align-items-center">
            <a href="/" class="fs-6 link-underline link-underline-opacity-0 me-2">Home</a>
            <button type="submit" class="btn btn-primary">Next</button>
        </div>
    </form>
{:else if state === 1}
    <div class="d-flex ">
        <p class="fs-5 gray-700 me-2">Processing...</p>
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
{:else if state === 2}
    <!-- svelte-ignore a11y-invalid-attribute -->
    <form bind:this={otp_form} on:submit={signup}>
        <div class="mb-3">
            <label for="otp-input" class="form-label">OTP</label>
            <input bind:value={otp_value} type="string" class="form-control" id="otp-input" autocomplete="off">
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <p class="gray-700 fs-6 mb-2">
                {time_text}
            </p>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <a href="/" class="fs-6 link-underline link-underline-opacity-0 me-2">Home</a>
            <div class="d-flex align-items-center">
                <a on:click={back} href="javascript:" class="fs-6 link-underline link-underline-opacity-0 me-2">Back</a>
                <button type="submit" class="btn btn-success">Signup</button>
            </div>
        </div>
    </form>
{:else}
    <div class="d-flex ">
        <p class="fs-5 gray-700 me-2">Signing Up...</p>
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
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

<style lang="scss">
    .password-container-parent
    {
        display: flex;
        flex-direction: row;
    }

    .password-container-left
    {
        padding-top: 0;
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0.25rem;
    }

    .password-container-right
    {
        padding-top: 0;
        padding-bottom: 0;
        padding-left: 0.25rem;
        padding-right: 0;
    }

    @media(max-width: 1400px)
    {
        .password-container-parent
        {
            flex-direction: column;
        }
        .password-container
        {
            min-width: fit-content;
        }
        .password-container-left
        {
            padding-right: 0;
        }

        .password-container-right
        {
            padding-left: 0;
        }
    }
</style>