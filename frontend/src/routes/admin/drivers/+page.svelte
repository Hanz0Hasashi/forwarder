<script lang="ts">
    import { onMount } from "svelte";
    

    type DriverRequest = {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        companyName: string | null;
        vatNumber: string | null;
        licenseClass: string;
        trailerType: string;
        hasWinch: boolean;
        hasCode95: boolean;
        createdAt: string;
    };

    let requests = $state<DriverRequest[]>([]);
    let statusMessage = "";
    let statusType: "success" | "error" | "" = "";
    let isLoading = $state(false);

    async function fetchRequests() {
        isLoading = true;
        try {
            const res = await fetch(
                `/api/driver-requests`,
            );
            if (res.ok) {
                const json = await res.json();
                requests = json.data;
            } else {
                showStatus("Failed to sync driver requests.", "error");
            }
        } catch (error) {
            console.error(error);
            showStatus("Failed to connect to backend.", "error");
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchRequests);

    let processingIds: string[] = [];

    function showStatus(message: string, type: "success" | "error") {
        statusMessage = message;
        statusType = type;
        setTimeout(() => {
            statusMessage = "";
            statusType = "";
        }, 4000);
    }

    function setProcessing(id: string, processing: boolean) {
        processingIds = processing
            ? [...processingIds, id]
            : processingIds.filter((pid) => pid !== id);
    }

    async function approveDriver(id: string) {
        setProcessing(id, true);

        try {
            const response = await fetch(
                `/api/driver-requests/${id}/approve`,
                {
                    method: "POST",
                },
            );
            const json = await response.json();

            if (!response.ok) {
                alert(json.detail || "Unable to approve the driver request.");
                showStatus(
                    json.detail || "Unable to approve the driver request.",
                    "error",
                );
                return;
            }

            requests = requests.filter((r) => r.id !== id);
            showStatus(
                json.message || "Driver approved successfully.",
                "success",
            );
        } catch (error) {
            console.error(error);
            alert("Unable to approve the driver request. Please try again.");
            showStatus(
                "Unable to approve the driver request. Please try again.",
                "error",
            );
        } finally {
            setProcessing(id, false);
        }
    }

    async function rejectDriver(id: string) {
        setProcessing(id, true);

        try {
            const response = await fetch(
                `/api/driver-requests/${id}/reject`,
                {
                    method: "POST",
                },
            );
            const json = await response.json();

            if (!response.ok) {
                showStatus(
                    json.detail || "Unable to reject the driver request.",
                    "error",
                );
                return;
            }

            requests = requests.filter((r) => r.id !== id);
            showStatus(json.message || "Driver request rejected.", "success");
        } catch (error) {
            console.error(error);
            showStatus(
                "Unable to reject the driver request. Please try again.",
                "error",
            );
        } finally {
            setProcessing(id, false);
        }
    }
</script>

<div class="p-8 max-w-[1400px] mx-auto">
    <!-- Header Area -->
    <div class="flex justify-between items-start mb-8">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">
                Pending Driver Applications
            </h1>
            <p class="text-sm text-slate-500">
                Review equipment profiles and compliance documents.
            </p>
        </div>
        <div class="flex items-center gap-3">
            <button
                type="button"
                onclick={fetchRequests}
                disabled={isLoading}
                class="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
                <svg
                    class={isLoading ? "animate-spin" : ""}
                    width="16"
                    height="16"
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
                Sync Requests
            </button>

        </div>
    </div>

    {#if statusMessage}
        <div
            class="mb-6 rounded-xl border px-5 py-4 text-sm font-medium shadow-sm"
            class:bg-emerald-50={statusType === "success"}
            class:text-emerald-700={statusType === "success"}
            class:border-emerald-200={statusType === "success"}
            class:bg-red-50={statusType === "error"}
            class:text-red-700={statusType === "error"}
            class:border-red-200={statusType === "error"}
        >
            {statusMessage}
        </div>
    {/if}

    <!-- Table Container -->
    <div
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
        <table class="w-full text-left border-collapse">
            <!-- This is the visible header row you wanted -->
            <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >Applicant</th
                    >
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >Contact</th
                    >
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >Company (VAT)</th
                    >
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >Equipment</th
                    >
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >Docs</th
                    >
                    <th
                        class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                        >Actions</th
                    >
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                {#each requests as req}
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-4 font-semibold text-slate-900"
                            >{req.firstName} {req.lastName}</td
                        >
                        <td class="p-4 text-sm text-slate-600">{req.email}</td>
                        <td class="p-4 text-sm">{req.companyName || "N/A"}</td>
                        <td class="p-4 text-sm">{req.trailerType}</td>
                        <td class="p-4">
                            {#if req.hasCode95}
                                <span
                                    class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200"
                                >
                                    ✅ Code 95
                                </span>
                            {/if}
                        </td>
                        <td class="p-4 text-right">
                            <div
                                class="inline-flex items-center justify-end gap-2"
                            >
                                <button
                                    type="button"
                                    onclick={() => approveDriver(req.id)}
                                    class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    disabled={processingIds.includes(req.id)}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onclick={() => rejectDriver(req.id)}
                                    class="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition duration-150 ease-in-out hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-red-100 disabled:text-red-200"
                                    disabled={processingIds.includes(req.id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
