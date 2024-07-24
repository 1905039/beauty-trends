<script lang="ts">
    import { logged_in, review_posted_toast_store, unknown_error_toast_store } from "$lib/stores";
    import { fade } from "svelte/transition";
    import RateInput from "./rate-input.svelte";
    import { respond401 } from "$lib/helpers";

    export let id: number;
    export let index: number;
    export let owned: boolean;
    export let parent_can_review: boolean;
    export let parent_reload: (() => void);
    let username: string;
    let rate: number;
    let review: string;
    let editing_review: string;
    let editing_rate: number;
    let review_form_elem: HTMLFormElement;
    let loaded: boolean = false;
    let editing: boolean = false;
    let deleting: boolean = false;
    let submitting: boolean = false;

    $: init(id);

    function edit(): void
    {
        editing = true;
        editing_review = review;
        editing_rate = rate;
    }

    function remove(): void
    {
        deleting = true;

        fetch("/api/delete-review",
        {
            method: "DELETE",
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                parent_can_review = true;

                parent_reload();
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

    function cancel(): void
    {
        editing = false;
    }

    function submit_review(): void
    {
        submitting = true;
        let temp_review: string | null | undefined = editing_review;

        if(temp_review === null || temp_review === undefined)
        {
            temp_review = "";
        }

        fetch("/api/edit-review",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id,
                rate: editing_rate,
                review: temp_review
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    review = editing_review;
                    rate = editing_rate;
                    submitting = false;
                    editing = false;

                    $review_posted_toast_store?.show();
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

    function init(id: number): void
    {
        loaded = false;

        fetch("/api/get-review-data",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                username = response_obj.data.__user_name;
                rate = response_obj.data.__rate;
                review = response_obj.data.__comment;
                loaded = true;
            }
            else
            {
                $unknown_error_toast_store?.show();
            }
        });
    }
</script>

<div class="card card-body placeholder-glow shadow mt-2">
    {#if loaded}
        {#if editing}
            <form bind:this={review_form_elem} on:submit={submit_review} action="javascript:" in:fade={{duration: 250}}>
                <p class="fs-4 fw-semibold gray-700">Edit Review</p>
                <textarea bind:value={editing_review} class="form-control" rows="3" placeholder="Tell us how you feel..." autocomplete="off"></textarea>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <RateInput bind:rate={editing_rate} />
                    <div class="d-flex align-items-center">
                        <button type="submit" class="btn btn-success" disabled={submitting}>Post</button>
                        <button on:click={cancel} type="button" class="btn btn-danger ms-2" disabled={submitting}>Cancel</button>
                    </div>
                </div>
            </form>
        {:else}
            <div in:fade={{duration: 250}}>
                <div class="d-flex alignt-items-center justify-content-between mb-2">
                    <div class="d-flex alignt-items-center">
                        <img src="/person.webp" alt="pfp" class="review-pfp rounded rounded-circle border my-auto me-2" />
                        <p class="fs-4 fw-semibold gray-700 m-0">{username}</p>
                    </div>
                    {#if $logged_in && owned && index === 0}
                        <div class="dropdown">
                            <button class="btn btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                </svg>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <button on:click={edit} class="dropdown-item" disabled={editing}>Edit</button>
                                </li>
                                <li>
                                    <button on:click={remove} class="dropdown-item" disabled={deleting}>Delete</button>
                                </li>
                            </ul>
                        </div>
                    {/if}
                </div>
                <div class="d-flex text-warning mb-2">
                    {#each [1, 2, 3, 4, 5] as i}
                        {#if rate >= i}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill me-2" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star me-2" viewBox="0 0 16 16">
                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                            </svg>
                        {/if}
                    {/each}
                </div>
                <p class="fs-5 gray-700 m-0">{review}</p>
            </div>
        {/if}
    {:else}
        <div class="d-flex alignt-items-center mb-2">
            <span class="review-pfp rounded rounded-circle border placeholder gray-500 my-auto me-2"></span>
            <p class="fs-4 fw-semibold gray-500 m-0">
                <span class="placeholder" style="width: 4em;"></span>
            </p>
        </div>
        <span class="placeholder gray-500 mb-2" style="width: 7em;"></span>
    {/if}
</div>

<style lang="scss">
    .review-pfp
    {
        width: 24px;
        height: 24px;
    }
</style>