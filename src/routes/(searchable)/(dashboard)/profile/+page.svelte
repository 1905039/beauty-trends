<script lang="ts">
    import { onMount } from "svelte";
    import { dashboard_active_tab_store, old_password_unmatch_toast_store, password_updated_toast_store, phone_exist_toast_store, unauthorized_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { fade } from "svelte/transition";
    import { Modal } from "bootstrap";
    import { respond401 } from "$lib/helpers";

    let name_og_value: string;
    let phone_og_value: string;
    let address_og_value: string;
    let name_input_value: string;
    let phone_input_value: string;
    let address_input_value: string;
    let student: number = 0;
    let old_password: string;
    let new_password: string;
    let confirm_password: string;
    let profile_updated: boolean;
    let profile_updating: boolean = false;
    let loaded: boolean = false;
    let apply_student_file_front_elem: HTMLInputElement;
    let apply_student_file_back_elem: HTMLInputElement;
    let password_changing: boolean = false;
    let apply_student_form_elem: HTMLFormElement;
    let password_form_elem: HTMLFormElement;
    let confirm_password_elem: HTMLInputElement;
    let applying_student: boolean = false;
    let student_modal_elem: HTMLDivElement;
    let student_modal: Modal;
    let password_modal_elem: HTMLDivElement;
    let password_modal: Modal;

    $: profile_updated = name_input_value !== name_og_value || phone_input_value !== phone_og_value || address_input_value !== address_og_value;

    function apply_student(): void
    {
        let file_front: File | null | undefined = apply_student_file_front_elem.files?.item(0);
        let file_back: File | null | undefined = apply_student_file_back_elem.files?.item(0);

        if(file_front === null || file_front === undefined)
        {
            return;
        }

        if(file_back === null || file_back === undefined)
        {
            return;
        }
        
        applying_student = true;
        let form_data: FormData = new FormData();

        form_data.append("front", file_front);
        form_data.append("back", file_back);

        fetch("/api/apply-student",
        {
            method: "POST",
            body: form_data
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    student_modal.hide();
                }
                else
                {
                    applying_student = false;

                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }
            }
            else
            {
                applying_student = false;

                if(response.status === 401)
                {
                    respond401();
                }
                else
                {
                    $unknown_error_toast_store?.show();
                }
            }
        });
    }

    function get_profile(): void
    {
        fetch("/api/get-profile",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    name_og_value = response_obj.profile.__name;
                    phone_og_value = response_obj.profile.__phone;
                    address_og_value = response_obj.profile.__address;
                    name_input_value = name_og_value;
                    phone_input_value = phone_og_value;
                    address_input_value = address_og_value;
                    student = response_obj.profile.__student;
                    loaded = true;
                }
                else
                {
                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }
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

    function profile_update(): void
    {
        profile_updating = true;

        fetch("/api/update-profile",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                name: name_input_value,
                address: address_input_value
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    get_profile();
                }
                else if(response_obj.success === -2)
                {
                    $phone_exist_toast_store?.show();
                }
                else
                {
                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }

                profile_updating = false;
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

    function change_password(): void
    {
        if(new_password !== confirm_password)
        {
            confirm_password_elem.setCustomValidity("Password does not match");
            confirm_password_elem.reportValidity();

            return;
        }

        password_changing = true;

        fetch("/api/change-password",
        {
            method: "POST",
            body: JSON.stringify(
            {
                old_password: old_password,
                new_password: new_password
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                
                if(response_obj.success === 0)
                {
                    $password_updated_toast_store?.show();
                }
                else if(response_obj.success === -1)
                {
                    $old_password_unmatch_toast_store?.show();
                }
                else
                {
                    $unknown_error_toast_store?.show();
                    console.error(response_obj.success);
                }

                password_changing = false;

                password_form_elem.reset();
                password_modal.hide();
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
        $dashboard_active_tab_store = ["active", "", "", ""];
        student_modal = new Modal(student_modal_elem);
        password_modal = new Modal(password_modal_elem);

        student_modal_elem.addEventListener("hidden.bs.modal", (): void =>
        {
            if(applying_student)
            {
                apply_student_form_elem.reset();

                applying_student = false;
                student = 1;
            }
        });
        get_profile();
    });
</script>

<form on:submit={profile_update}>
    <div class="card card-body placeholder-glow shadow mb-4">
        {#if loaded}
            <img src="/person.webp" class="border rounded rounded-circle mb-3" alt="pfp" width="128px" height="128px" in:fade={{duration: 250}}>
        {:else}
            <span class="placeholder rounded rounded-circle gray-500 mb-3" style="width: 128px; height: 128px"></span>
        {/if}
        <div class="mb-2">
            <label for="profile-name" class="form-label fs-5 fw-semibold gray-700">Name</label>
            {#if loaded}
                <input bind:value={name_input_value} type="text" class="form-control" id="profile-name" autocomplete="off" in:fade={{duration: 250}}>
            {:else}
                <input type="text" class="form-control placeholder gray-500" id="profile-name" autocomplete="off">
            {/if}
        </div>
        <div>
            <label for="profile-phone" class="form-label fs-5 fw-semibold gray-700">Contact</label>
            {#if loaded}
                <input bind:value={phone_input_value} type="tel" class="form-control" id="profile-phone" autocomplete="off" in:fade={{duration: 250}} readonly>
            {:else}
                <input type="tel" class="form-control placeholder gray-500" id="profile-phone" autocomplete="off">
            {/if}
        </div>
        {#if loaded && student === 0}
            <div class="d-flex justify-content-end mt-2" in:fade={{duration: 250}}>
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a data-bs-toggle="modal" data-bs-target="#student-modal" href="javascript:" type="button" class="link-underline link-underline-opacity-0">Apply Student Discount</a>
            </div>
        {:else if loaded && student === 1}
            <div class="d-flex justify-content-end mt-2" in:fade={{duration: 250}}>
                <p class="orange-500 m-0">Student Application Pending</p>
            </div>
        {:else if loaded && student === 2}
            <div class="d-flex justify-content-end mt-2" in:fade={{duration: 250}}>
                <p class="text-success m-0">Student Discount Available</p>
            </div>
        {/if}
    </div>
    <div class="card card-body shadow placeholder-glow mb-4">
        <div>
            <label for="profile-address" class="form-label fs-5 fw-semibold gray-700">Shipping Address</label>
            {#if loaded}
                <textarea bind:value={address_input_value} class="form-control" id="profile-address" rows="3" autocomplete="off" in:fade={{duration: 250}}></textarea>
            {:else}
                <textarea class="form-control placeholder gray-500" id="profile-address" rows="3" autocomplete="off"></textarea>
            {/if}
        </div>
    </div>
    {#if loaded}
        <div class="d-flex justify-content-end" in:fade={{duration: 250}}>
            {#if profile_updated}
                <button type="submit" class="btn btn-success me-2" disabled={profile_updating && loaded} transition:fade={{duration: 250}}>Save</button>
            {/if}
            <button data-bs-toggle="modal" data-bs-target="#password-modal" type="button" class="btn btn-primary">Change Password</button>
        </div>
    {/if}
</form>

{#if student === 0}
    <div bind:this={student_modal_elem} class="modal fade" id="student-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="student-static-backdrop" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="student-static-backdrop">Institution ID Card</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form bind:this={apply_student_form_elem} on:submit={apply_student} action="javascript:">
                        <div>
                            <label for="id-front-file" class="form-label">Front</label>
                            <input bind:this={apply_student_file_front_elem} class="form-control" id="id-front-file" type="file" accept="image/*" required>
                        </div>
                        <div class="mt-4">
                            <label for="id-back-file" class="form-label">Back</label>
                            <input bind:this={apply_student_file_back_elem} class="form-control" id="id-back-file" type="file" accept="image/*" required>
                        </div>
                        <div class="d-flex justify-content-end mt-2">
                            <button type="submit" class="btn btn-success" disabled={applying_student}>Apply</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
{/if}

<div bind:this={password_modal_elem} class="modal fade" id="password-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="password-static-backdrop" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="password-static-backdrop">Change Password</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form bind:this={password_form_elem} on:submit={change_password} action="javascript:">
                    <div class="form-floating mb-3">
                        <input bind:value={old_password} type="password" class="form-control" id="old-password" placeholder="Old Password" minlength="8" autocomplete="off" required>
                        <label for="old-password">Old Password</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input bind:value={new_password} type="password" class="form-control" id="new-password" placeholder="New Password" minlength="8" autocomplete="off" required>
                        <label for="new-password">New Password</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input bind:this={confirm_password_elem} bind:value={confirm_password} type="password" class="form-control" id="confirm-password" placeholder="Confirm Password" minlength="8" autocomplete="off" required>
                        <label for="confirm-password">Confirm Password</label>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-success" disabled={password_changing}>Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>