<script>
    import { goto } from "$app/navigation";


    import { dashboard_active_tab_store } from "$lib/stores";

</script>
<!-- svelte-ignore a11y-invalid-attribute -->
<div class="dash-root">
    <div class="dash-container">
        <div class="dash-left card card-body shadow fs-5">
            <ul class="tab-pills nav nav-pills" role="tablist">
                <li class="nav-item">
                    <a href="/profile" class="nav-link d-flex align-items-center {$dashboard_active_tab_store[0]} w-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                        </svg>
                        <span class="tab-title ms-2">Profile</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/cart" class="nav-link d-flex align-items-center {$dashboard_active_tab_store[1]} w-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                        <span class="tab-title ms-2">Cart</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/pending-orders" class="nav-link d-flex align-items-center {$dashboard_active_tab_store[2]} w-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                        </svg>
                        <span class="tab-title ms-2">Pending Orders</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/complete-orders" class="nav-link d-flex align-items-center {$dashboard_active_tab_store[3]} w-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                        </svg>
                        <span class="tab-title ms-2">Complete Orders</span>
                    </a>
                </li>
              </ul>
        </div>
        <div class="dash-right tab-content">
            <div class="dash-tab-pane">
                <slot></slot>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .dash-root
    {
        position: relative;
        width: 65rem;
        left: 0;
        right: 0;
        margin-top: 4rem;
        margin-bottom: 4rem;
        margin-left: auto;
        margin-right: auto;
        flex-grow: 1;
    }
    .dash-container
    {
        position: relative;
        height: 100%;
        display: flex;
    }
    .dash-left
    {
        position: relative;
        top: 0;
        width: 30%;
        margin-right: 1rem;
    }
    .tab-pills
    {
        flex-direction: column;
        justify-content: center;
    }
    .dash-right
    {
        position: relative;
        top: 0;
        bottom: 0;
        width: 70%;
        margin-bottom: 2rem;
    }
    @media(max-width: 1099px)
    {
        .dash-root
        {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            padding-left: 1rem;
            padding-right: 1rem;
        }
        .dash-container
        {
            display: block;
        }
        .dash-left
        {
            width: 100%;
            margin-bottom: 1rem;
        }
        .tab-pills
        {
            flex-direction: row;
        }
        .tab-title
        {
            display: none;
        }
        .dash-right
        {
            width: 100%;
        }
    }
    @media(max-width: 499px)
    {
        .dash-root
        {
            margin-top: 1rem;
        }
    }
</style>