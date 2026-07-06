<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    

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
    let statusMessage = $state("");
    let statusType = $state<"success" | "error" | "">("");
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

    let processingIds = $state<string[]>([]);

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

<div class="surface-canvas p-8 max-w-[1400px] mx-auto">
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
            <Button
                type="button"
                onclick={fetchRequests}
                disabled={isLoading}
                variant="outline"
                extraClass="gap-2"
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
            </Button>

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
    <div class="surface-card rounded-xl overflow-hidden">
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
                                <StatusBadge tone="success" extraClass="gap-1 rounded px-2 py-1 normal-case tracking-normal">
                                    ✅ Code 95
                                </StatusBadge>
                            {/if}
                        </td>
                        <td class="p-4 text-right">
                            <div
                                class="inline-flex items-center justify-end gap-2"
                            >
                                <Button
                                    type="button"
                                    onclick={() => approveDriver(req.id)}
                                    variant="secondary"
                                    extraClass="rounded-full"
                                    disabled={processingIds.includes(req.id)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    type="button"
                                    onclick={() => rejectDriver(req.id)}
                                    variant="outline"
                                    extraClass="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                                    disabled={processingIds.includes(req.id)}
                                >
                                    Reject
                                </Button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
