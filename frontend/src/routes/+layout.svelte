<script lang="ts">
    import { ClerkProvider, UserButton } from "svelte-clerk";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { translations, type Lang } from "$lib/translations.js";
    import "../app.css";

    let { children } = $props();

    let isChecking = $state(true);
    let currentRole = $state("");
    let mobileMenuOpen = $state(false);
    let lang = $state<Lang>("en");
    
    let t = $derived(translations[lang]);

    onMount(() => {
        currentRole = localStorage.getItem("userRole") || "";
        lang = (localStorage.getItem("shutup-lang") as Lang) || "en";
        isChecking = false;
    });

    function setLang(l: Lang) {
        lang = l;
        localStorage.setItem("shutup-lang", l);
        window.location.reload();
    }

    $effect(() => {
        if (isChecking) return;

        const currentPath = $page.url.pathname;

        const isPublicRoute =
            currentPath === "/" ||
            currentPath.startsWith("/login") ||
            currentPath.startsWith("/signup") ||
            currentPath.startsWith("/driver-apply") ||
            currentPath.startsWith("/auth-sync");

        if (!currentRole && !isPublicRoute) {
            goto("/login");
        } else if (
            (currentRole === "FORWARDER" || currentRole === "employee") &&
            currentPath.startsWith("/admin")
        ) {
            goto("/");
        }
    });

    // Dynamic background check: Wipes localStorage role and redirects to login if Clerk user signs out
    $effect(() => {
        const interval = setInterval(() => {
            if (typeof window !== "undefined" && (window as any).Clerk) {
                const clerk = (window as any).Clerk;
                if (clerk.loaded && !clerk.user && currentRole) {
                    currentRole = "";
                    localStorage.clear();
                    window.location.href = "/";
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    let navLinks = $derived(() => {
        if (!currentRole) {
            return [
                { name: t.nav_how, href: "/#how-it-works" },
                { name: t.nav_step, href: "/#step-by-step" },
                { name: t.nav_features, href: "/#features" },
                { name: t.nav_faq, href: "/#faq" },
                { name: t.nav_drivers, href: "/#drivers" },
            ];
        }

        if (currentRole === "admin" || currentRole === "ADMIN") {
            return [
                { name: t.nav_trips_board, href: "/trips" },
                { name: t.nav_manage_team, href: "/admin/users" },
                { name: t.nav_driver_requests, href: "/admin/drivers" },
            ];
        } else if (currentRole === "FORWARDER" || currentRole === "employee") {
            return [
                { name: t.nav_available_loads, href: "/jobs" },
                { name: t.nav_my_trips, href: "/trips" },
            ];
        } else {
            return [
                { name: t.nav_book_service, href: "/submit" },
                { name: t.nav_my_trips, href: "/trips" },
            ];
        }
    });

    let displayRole = $derived(() => {
        if (currentRole === "admin" || currentRole === "ADMIN") return "ADMIN";
        if (currentRole === "FORWARDER" || currentRole === "employee")
            return "DRIVER";
        if (currentRole === "CUSTOMER" || currentRole === "client")
            return "CLIENT";
        return currentRole || "GUEST";
    });
</script>

<ClerkProvider>
    {#if !isChecking}
        <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
            {#if !$page.url.pathname.startsWith("/login") && !$page.url.pathname.startsWith("/signup") && !$page.url.pathname.startsWith("/driver-apply") && !$page.url.pathname.startsWith("/auth-sync")}
                <header class="layout-navbar sticky top-0 z-50">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex items-center justify-between h-16">
                            <!-- Logo Brand -->
                            <a
                                href="/"
                                class="flex items-center space-x-3 text-white hover:opacity-90 no-underline"
                            >
                                <span class="logo-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="30"
                                        height="30"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#60a5fa"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M10 17h4V5H2v12h3"></path>
                                        <path
                                            d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"
                                        ></path>
                                        <path d="M14 17h1"></path>
                                        <circle cx="7.5" cy="17.5" r="2.5"
                                        ></circle>
                                        <circle cx="17.5" cy="17.5" r="2.5"
                                        ></circle>
                                    </svg>
                                </span>
                                <span class="font-black text-lg tracking-wider">
                                    SHUTUP <span class="text-blue-400"
                                        >FORWARDER</span
                                    >
                                </span>
                            </a>

                            <!-- Desktop nav items -->
                            <nav class="hidden md:flex space-x-6 items-center">
                                {#each navLinks() as link}
                                    <a
                                        href={link.href}
                                        class="text-sm font-bold tracking-wide transition-colors duration-150 no-underline
                                              {$page.url.pathname ===
                                            link.href ||
                                        ($page.url.pathname.startsWith(
                                            link.href,
                                        ) &&
                                            link.href !== '/')
                                            ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                                            : 'text-slate-300 hover:text-white'}"
                                    >
                                        {link.name}
                                    </a>
                                {/each}
                            </nav>

                            <!-- Actions, Language Toggle & User Button -->
                            <div class="hidden md:flex items-center space-x-4">
                                {#if $page.url.pathname === "/"}
                                    <div class="lang-switcher">
                                        <button
                                            class="lang-btn"
                                            class:active={lang === "en"}
                                            onclick={() => setLang("en")}
                                            >EN</button
                                        >
                                        <button
                                            class="lang-btn"
                                            class:active={lang === "de"}
                                            onclick={() => setLang("de")}
                                            >DE</button
                                        >
                                    </div>
                                {/if}

                                {#if currentRole}
                                    <span
                                        class="text-xs font-black uppercase tracking-widest text-blue-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700"
                                    >
                                        {displayRole()}
                                    </span>

                                    {#if currentRole !== 'admin' && currentRole !== 'ADMIN'}
                                        <a
                                            href="/"
                                            class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2 px-4 rounded-lg border border-slate-700 transition-colors no-underline"
                                        >
                                            Dashboard
                                        </a>
                                    {/if}

                                    <div
                                        class="bg-white rounded-full flex items-center justify-center p-0.5 ml-2"
                                    >
                                        <UserButton />
                                    </div>
                                {:else}
                                    <a
                                        href="/login"
                                        class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors no-underline"
                                    >
                                        Sign In
                                    </a>
                                {/if}
                            </div>

                            <!-- Mobile Menu Burger Button -->
                            <button
                                class="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer border-0"
                                onclick={() =>
                                    (mobileMenuOpen = !mobileMenuOpen)}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    viewBox="0 0 24 24"
                                >
                                    {#if mobileMenuOpen}
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    {:else}
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    {/if}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Mobile Navigation Menu -->
                    {#if mobileMenuOpen}
                        <div
                            class="md:hidden bg-slate-900 border-t border-slate-800 animate-fade-in px-4 pt-2 pb-4 space-y-3"
                        >
                            {#each navLinks() as link}
                                <a
                                    href={link.href}
                                    onclick={() => (mobileMenuOpen = false)}
                                    class="block text-slate-300 hover:text-white font-bold py-2 text-sm no-underline"
                                >
                                    {link.name}
                                </a>
                            {/each}

                            <hr class="border-slate-800 my-1" />

                            {#if $page.url.pathname === "/"}
                                <div
                                    class="flex items-center justify-between py-1"
                                >
                                    <span
                                        class="text-xs text-slate-400 font-bold uppercase tracking-wider"
                                        >Language</span
                                    >
                                    <div class="lang-switcher">
                                        <button
                                            class="lang-btn"
                                            class:active={lang === "en"}
                                            onclick={() => setLang("en")}
                                            >EN</button
                                        >
                                        <button
                                            class="lang-btn"
                                            class:active={lang === "de"}
                                            onclick={() => setLang("de")}
                                            >DE</button
                                        >
                                    </div>
                                </div>
                            {/if}

                            {#if currentRole}
                                <div
                                    class="flex items-center justify-between pt-2"
                                >
                                    <span
                                        class="text-xs font-black uppercase tracking-widest text-blue-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700"
                                    >
                                        {displayRole()}
                                    </span>
                                    <div
                                        class="bg-white rounded-full flex items-center justify-center p-0.5"
                                    >
                                        <UserButton />
                                    </div>
                                </div>
                            {:else}
                                <a
                                    href="/login"
                                    class="block bg-blue-600 hover:bg-blue-500 text-white text-center font-bold py-2 rounded-lg no-underline text-sm"
                                >
                                    Sign In
                                </a>
                            {/if}
                        </div>
                    {/if}
                </header>
            {/if}

            {#if $page.url.pathname === "/"}
                {@render children()}
            {:else}
                <main
                    class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    {@render children()}
                </main>
            {/if}
        </div>
    {:else}
        <div class="h-screen bg-slate-50"></div>
    {/if}
</ClerkProvider>

<style>
    /* Premium dark Slate/Blue theme styles for our header */
    .layout-navbar {
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .lang-switcher {
        display: flex;
        gap: 1px;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.6);
        padding: 2px;
    }

    .lang-btn {
        background: none;
        border: none;
        padding: 4px 10px;
        font-size: 0.7rem;
        font-weight: 800;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.65);
        transition: all 0.2s ease;
        border-radius: 5px;
    }

    .lang-btn.active {
        background: #2563eb;
        color: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .lang-btn:hover:not(.active) {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }
</style>
