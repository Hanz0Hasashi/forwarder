<script lang="ts">
    import { onMount } from "svelte";
    import { API_BASE_URL } from "$lib/api.js";

    interface Job {
        id: string;
        jobNumber: number; // ── NEW: Clean integer ID ──
        make: string;
        model: string;
        year: number;
        pickup: string;
        delivery: string;
        status: string;
        aiIsValid: boolean;
        aiReasoning: string;
    }

    // 1. SVELTE 5 REACTIVE STATE RUNES
    let dbJobs = $state<Job[]>([]);
    let isLoading = $state(true);
    let filter = $state("all"); // 'all', 'invalid', 'valid'

    // Your exact premium European dummy loads (updated to use jobNumber)
    const dummyJobs: Job[] = [
        {
            id: "SF-9041",
            jobNumber: 9041,
            make: "Mercedes-Benz",
            model: "G-Class",
            year: 2023,
            pickup: "Rotterdam (NL)",
            delivery: "Stuttgart (DE)",
            status: "action_required",
            aiIsValid: false,
            aiReasoning:
                "Unresolved deep scratches detected on front bumper left corner edge profile frame.",
        },
        {
            id: "SF-4821",
            jobNumber: 4821,
            make: "BMW",
            model: "3 Series",
            year: 2019,
            pickup: "Amsterdam (NL)",
            delivery: "Munich (DE)",
            status: "ready_for_dispatch",
            aiIsValid: true,
            aiReasoning:
                "Structural profiles verify 100% baseline match. Zero surface exceptions registered.",
        },
        {
            id: "SF-3110",
            jobNumber: 3110,
            make: "Audi",
            model: "A6 Avant",
            year: 2021,
            pickup: "Antwerp (BE)",
            delivery: "Lyon (FR)",
            status: "ready_for_dispatch",
            aiIsValid: true,
            aiReasoning:
                "High confidence structural analysis complete. Exterior panels cleared safely.",
        },
    ];

    // Fetch live manifests from Railway infrastructure production node
    async function fetchJobs() {
        isLoading = true;
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/jobs`,
            );
            if (response.ok) {
                const result = await response.json();
                dbJobs = result.data;
            }
        } catch (e) {
            console.error("Failed to fetch jobs:", e);
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchJobs);

    // Combine dummy array with live database rows cleanly
    let allCombinedJobs = $derived(() => {
        return [...dummyJobs, ...dbJobs];
    });

    // 2. SVELTE 5 FINE-GRAINED FILTER RUNES
    let filteredJobs = $derived(() => {
        const combined = allCombinedJobs();
        if (filter === "valid")
            return combined.filter((j) => j.aiIsValid === true);
        if (filter === "invalid")
            return combined.filter((j) => j.aiIsValid === false);
        return combined;
    });

    // Active deletion handler connected directly to your backend endpoint
    async function deleteJob(id: string, jobNumber: number) {
        // Prevent deleting our static frontend demo files
        if (id.startsWith("SF-")) {
            alert(
                "Static demo manifest items cannot be deleted from the remote cluster.",
            );
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete Job SF-${jobNumber}? This cannot be undone.`,
        );
        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/jobs/${id}`,
                {
                    method: "DELETE",
                },
            );

            if (response.ok) {
                dbJobs = dbJobs.filter((job) => job.id !== id);
                console.log(`Job SF-${jobNumber} deleted successfully.`);
            } else {
                const error = await response.json();
                alert("Failed to delete: " + error.detail);
            }
        } catch (e) {
            console.error("Network error during deletion:", e);
            alert("Could not reach the server to delete the job.");
        }
    }
</script>

<div class="space-y-8 animate-fade-in p-6 bg-slate-50 min-h-[85vh]">
    <div
        class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4"
    >
        <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">
                Logistics Command Center
            </h1>
            <p class="text-sm text-slate-500 mt-1">
                Overview of hybrid mockup manifests merged with real database
                records.
            </p>
        </div>

        <div class="flex items-center gap-3 text-xs font-semibold">
            <span
                class="bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-full text-xs"
            >
                Total Loaded: {allCombinedJobs().length} ({dummyJobs.length} Demo
                + {dbJobs.length} Live)
            </span>

            <a
                href="/admin/users"
                class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-sm transition-all text-xs no-underline"
            >
                👥 Manage Team
            </a>

            <a
                href="/admin/drivers"
                class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-sm transition-all text-xs no-underline"
            >
                🚛 Drivers requests
            </a>

            <button
                onclick={fetchJobs}
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-sm transition-colors text-xs border-0 cursor-pointer"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42l5.6 5.6"
                    />
                </svg>
                Sync Engine
            </button>
        </div>
    </div>

    <div
        class="bg-slate-200/70 p-1.5 rounded-xl inline-flex items-center gap-1.5 border border-slate-300/40"
    >
        <button
            onclick={() => (filter = "all")}
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer
                   {filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900'}"
        >
            All Jobs
        </button>
        <button
            onclick={() => (filter = "invalid")}
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer
                   {filter === 'invalid'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900'}"
        >
            ⚠️ Action Required
        </button>
        <button
            onclick={() => (filter = "valid")}
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer
                   {filter === 'valid'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900'}"
        >
            ✅ Ready for Dispatch
        </button>
    </div>

    {#if isLoading}
        <div
            class="py-20 text-center space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
            <div
                class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"
            ></div>
            <p class="text-slate-500 text-sm font-semibold tracking-wide">
                Syncing manifests with production cluster...
            </p>
        </div>
    {:else if filteredJobs().length === 0}
        <div
            class="p-16 text-center text-sm text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
            No active shipping records found matching this filtering context.
        </div>
    {:else}
        <div
            class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100"
        >
            {#each filteredJobs() as job (job.id)}
                <div
                    class="p-6 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative"
                    class:border-l-4={!job.aiIsValid}
                    class:border-l-red-500={!job.aiIsValid}
                >
                    <div class="space-y-2 max-w-xl flex-1">
                        <div class="flex items-center gap-3 flex-wrap">
                            <span
                                class="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm"
                            >
                                SF-{job.jobNumber || "ERR"}
                            </span>

                            <span
                                class="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border
                                       {job.aiIsValid
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'}"
                            >
                                {job.aiIsValid
                                    ? "Cleared"
                                    : "Flagged Exception"}
                            </span>
                            {#if job.id.startsWith("SF-")}
                                <span
                                    class="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                                    >Demo Static</span
                                >
                            {/if}
                        </div>
                        <h2
                            class="text-xl font-extrabold text-slate-900 tracking-tight"
                        >
                            {job.year || ""}
                            {job.make || "Unknown"}
                            {job.model || "Vehicle File"}
                        </h2>

                        <div
                            class="flex items-center gap-3 text-sm font-semibold text-slate-600 pt-1"
                        >
                            <span
                                class="flex items-center gap-1.5 text-slate-700"
                                >📍 {job.pickup
                                    ? job.pickup.split(",")[0]
                                    : "Origin Point"}</span
                            >
                            <span class="text-slate-300">➔</span>
                            <span
                                class="flex items-center gap-1.5 text-blue-600"
                                >🏁 {job.delivery
                                    ? job.delivery.split(",")[0]
                                    : "Destination Point"}</span
                            >
                        </div>
                    </div>

                    <div
                        class="w-full lg:w-80 bg-slate-50/80 border border-slate-200 p-4 rounded-xl text-xs space-y-1.5"
                    >
                        <span
                            class="text-slate-400 font-bold uppercase tracking-wider text-[10px] block"
                            >Computational Vision Log</span
                        >
                        <p
                            class="text-slate-600 font-medium leading-relaxed italic m-0"
                        >
                            "{job.aiReasoning ||
                                "System logs contain zero structural discrepancies or geometric exceptions."}"
                        </p>
                    </div>

                    <div
                        class="flex items-center gap-3 w-full lg:w-auto justify-end border-t border-slate-100 lg:border-t-0 pt-4 lg:pt-0"
                    >
                        <span
                            class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200"
                        >
                            {job.status || "Received"}
                        </span>

                        <a
                            href=""
                            class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-lg border border-slate-200 shadow-sm transition-colors no-underline text-center"
                        >
                            Review Manifest
                        </a>

                        <button
                            onclick={() => deleteJob(job.id, job.jobNumber)}
                            class="bg-transparent border border-rose-200/60 hover:border-rose-400 text-rose-500 hover:bg-rose-50/50 p-2.5 rounded-lg transition-all cursor-pointer"
                            title="Purge shipping sequence reference"
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
