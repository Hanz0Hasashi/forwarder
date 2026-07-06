<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";
    

    // Existing state
    let availableJobs = $state<any[]>([]);
    let isLoading = $state(true);

    // New Bidding State
    let selectedJob = $state<any>(null);
    let isFetchingDetails = $state(false);
    let bidAmount = $state<number | "">("");
    let isSubmittingBid = $state(false);

    onMount(async () => {
        try {
            const res = await fetch(
                `/api/jobs`,
            );
            if (res.ok) {
                const responseData = await res.json();
                const allJobs = responseData.data || responseData;

                // FILTER APPLIED: Only grabs fresh jobs
                availableJobs = allJobs.filter(
                    (job: any) => job.status === "Reviewing",
                );
            }
        } catch (error) {
            console.error("Failed to load live jobs:", error);
        } finally {
            isLoading = false;
        }
    });

    // 1. Fetch job details and open the sidebar
    async function openBiddingStation(jobId: string) {
        isFetchingDetails = true;
        selectedJob = null;
        try {
            const response = await fetch(
                `/api/jobs/${jobId}`,
            );
            const result = await response.json();
            if (result.status === "success") {
                selectedJob = result.data;
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            isFetchingDetails = false;
        }
    }

    // 2. Submit the driver's bid
    async function submitBid() {
        if (!bidAmount || bidAmount <= 0)
            return alert("Please enter a valid amount!");

        isSubmittingBid = true;

        const driverId = (typeof window !== 'undefined' && (window as any).Clerk?.user?.id) || null;
        const driverName = (typeof window !== 'undefined' && (window as any).Clerk?.user?.fullName) || "Test Driver";

        try {
            const response = await fetch(
                `/api/jobs/${selectedJob.id}/bids`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        driverName: driverName,
                        amount: bidAmount,
                        forwarderId: driverId
                    }),
                },
            );

            const result = await response.json();

            if (result.status === "success") {
                // Svelte 5 reactivity: Create a new array to trigger UI update
                selectedJob.bids = [...(selectedJob.bids || []), result.data];
                bidAmount = ""; // Clear input
            } else {
                alert("Failed to submit bid.");
            }
        } catch (error) {
            console.error("Error submitting bid:", error);
            alert("Network error while submitting bid.");
        } finally {
            isSubmittingBid = false;
        }
    }

    let isAcceptingDeal = $state(false);

    async function acceptCounterOffer(bidId: string) {
        isAcceptingDeal = true;
        try {
            const response = await fetch(
                `/api/jobs/${selectedJob.id}/bids/${bidId}/accept`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                },
            );

            const result = await response.json();

            if (result.status === "success") {
                // Update the local bid status to reflect the new state
                const bid = selectedJob.bids.find((b: any) => b.id === bidId);
                if (bid) {
                    bid.status = "AWAITING_CLIENT_APPROVAL";
                }
                alert("Offer accepted! Waiting for final client approval.");
            } else {
                alert("Failed to accept the deal.");
            }
        } catch (error) {
            console.error("Error accepting deal:", error);
            alert("Network error.");
        } finally {
            isAcceptingDeal = false;
        }
    }
    let isCancelingDeal = $state(false);

    async function cancelBid(bidId: string) {
        if (!confirm("Are you sure you want to retract this bid?")) return;
        
        isCancelingDeal = true;
        try {
            const response = await fetch(
                `/api/jobs/${selectedJob.id}/bids/${bidId}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                selectedJob.bids = selectedJob.bids.filter((b: any) => b.id !== bidId);
            } else {
                alert("Failed to cancel bid.");
            }
        } catch (error) {
            console.error("Error canceling bid:", error);
            alert("Network error.");
        } finally {
            isCancelingDeal = false;
        }
    }
</script>

<div class="mx-auto w-full max-w-[1480px] min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <header class="mb-10">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
            Available Loads
        </h1>
        <p class="mt-1 text-sm font-medium text-slate-500">
            Select a job to view details and negotiate your rate.
        </p>
    </header>

    <div class="grid items-start gap-8 lg:grid-cols-[1fr_480px]">
        <div class="space-y-4">
            {#each availableJobs as job}
                <div
                    class="grid cursor-pointer items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr] md:px-6"
                    class:border-blue-500={selectedJob?.id === job.id}
                    class:bg-blue-50={selectedJob?.id === job.id}
                    onclick={() => openBiddingStation(job.id)}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openBiddingStation(job.id) }}
                    role="button"
                    tabindex="0"
                >
                    <div class="flex flex-col gap-1">
                        <span class="w-fit rounded border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">SF-{job.jobNumber}</span>
                        <span class="text-sm font-bold text-slate-900">{job.make || job.vehicleMake || ""} {job.model || job.vehicleModel || "Unknown Vehicle"}</span>
                        <span class="text-xs text-slate-500">Year: {job.year || "N/A"} · Runs: {job.runs || "N/A"}</span>
                    </div>
                    <div class="text-sm font-semibold text-slate-700">
                        {(job.pickup || job.pickupAddress || "N/A").split(",")[0]} ➔ {(job.delivery || job.deliveryAddress || "N/A").split(",")[0]}
                    </div>
                    <div>
                        <span class="inline-flex rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">{job.distance || "Calc Pending"}</span>
                    </div>
                    <div class="text-lg font-extrabold text-emerald-600">
                        {job.targetPrice
                            ? `€${job.targetPrice}`
                            : job.payout
                            ? `€${job.payout.replace("₹", "")}`
                            : "€500"}
                    </div>
                    <div>
                        <button
                            class="w-full rounded-lg border px-3 py-2 text-xs font-semibold transition"
                            class:bg-blue-600={selectedJob?.id === job.id}
                            class:border-blue-600={selectedJob?.id === job.id}
                            class:text-white={selectedJob?.id === job.id}
                            class:hover:bg-blue-700={selectedJob?.id === job.id}
                            class:bg-white={selectedJob?.id !== job.id}
                            class:border-slate-300={selectedJob?.id !== job.id}
                            class:text-slate-600={selectedJob?.id !== job.id}
                            class:hover:bg-slate-50={selectedJob?.id !== job.id}
                        >
                            {selectedJob?.id === job.id ? "Selected" : "View"}
                        </button>
                    </div>
                </div>
            {/each}

            {#if availableJobs.length === 0 && !isLoading}
                <div class="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                    No jobs available right now. Check back later!
                </div>
            {/if}
        </div>

        <div class="lg:sticky lg:top-8">
            {#if selectedJob}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div class="border-b border-slate-200 bg-slate-50 p-6">
                        <h2 class="text-xl font-extrabold text-slate-900">{selectedJob.make} {selectedJob.model}</h2>
                        <p class="mt-1 font-mono text-xs font-semibold text-slate-500">Tracking: {selectedJob.trackingNumber}</p>
                    </div>

                    <div class="p-6">
                        <h3 class="mb-4 text-sm font-extrabold uppercase tracking-wider text-slate-600">Live Negotiations</h3>

                        <div class="mb-6 max-h-[400px] space-y-4 overflow-y-auto pr-1">
                            {#if selectedJob.bids && selectedJob.bids.length > 0}
                                {#each selectedJob.bids as bid}
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                        <div class="flex items-center justify-between gap-3">
                                            <span class="text-sm font-bold text-slate-900">{bid.driverName}</span>
                                            <div class="text-right">
                                                <span
                                                    class="block text-xl font-extrabold"
                                                    class:text-red-500={bid.status === "REJECTED"}
                                                    class:text-green-500={bid.status === "ACCEPTED"}
                                                    class:text-slate-900={bid.status !== "REJECTED" && bid.status !== "ACCEPTED"}
                                                >
                                                    €{bid.amount}
                                                </span>
                                                <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-500">{bid.status.replace(/_/g, " ")}</span>
                                            </div>
                                        </div>

                                        {#if bid.status === "COUNTER_OFFERED" && bid.aiCounterAmount}
                                            <div class="mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <div class="flex flex-col">
                                                    <span class="text-[10px] font-bold uppercase tracking-wide text-slate-500">AI Counter Offer</span>
                                                    <span class="text-xl font-extrabold text-blue-600">€{bid.aiCounterAmount}</span>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    disabled={isAcceptingDeal}
                                                    onclick={() => acceptCounterOffer(bid.id)}
                                                >
                                                    {isAcceptingDeal ? "..." : "Accept"}
                                                </Button>
                                            </div>
                                        {:else if bid.status === "AWAITING_CLIENT_APPROVAL"}
                                            <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                                <span class="block text-[10px] font-bold uppercase tracking-wide text-amber-700">Awaiting Client Approval</span>
                                                <span class="text-sm font-semibold text-amber-900">The client is reviewing your final rate.</span>
                                            </div>
                                        {:else if bid.status === "ACCEPTED"}
                                            <div class="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-bold text-emerald-700">Offer Accepted!</span>
                                                    <span class="text-sm font-semibold text-emerald-600">You won this load.</span>
                                                </div>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onclick={() => {
                                                        localStorage.setItem("activeTransitJob", JSON.stringify(selectedJob));
                                                        goto("/jobs/active");
                                                    }}
                                                >
                                                    Proceed to Load
                                                </Button>
                                            </div>
                                        {:else}
                                            <div class="mt-4 flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100 p-3">
                                                <span class="text-sm font-bold text-slate-600">
                                                    {#if bid.status === "REJECTED"}
                                                        Offer Rejected
                                                    {:else}
                                                        Awaiting Review
                                                    {/if}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    extraClass="border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-60"
                                                    disabled={isCancelingDeal}
                                                    onclick={() => cancelBid(bid.id)}
                                                >
                                                    {isCancelingDeal ? "..." : "Retract Bid"}
                                                </Button>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            {:else}
                                <p class="py-8 text-center text-sm italic text-slate-500">No bids yet. Start the negotiation!</p>
                            {/if}
                        </div>

                        <div class="mt-4 flex gap-3 border-t border-slate-200 pt-5">
                            <input
                                type="number"
                                bind:value={bidAmount}
                                placeholder="Offer €..."
                                class="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                            />
                            <Button
                                variant="primary"
                                size="lg"
                                extraClass="rounded-xl px-6"
                                disabled={isSubmittingBid}
                                onclick={submitBid}
                            >
                                {isSubmittingBid ? "..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">
                    <svg class="mx-auto mb-4 h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                    <p class="text-xl font-extrabold text-slate-600">Select a Load</p>
                    <p class="mt-2 text-sm font-medium text-slate-500">Click "View" to open the negotiation terminal.</p>
                </div>
            {/if}
        </div>
    </div>
</div>
