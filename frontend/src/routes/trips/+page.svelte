<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    

    let trips = $state<any[]>([]);
    let isLoading = $state(true);
    let currentRole = $state("");
    let currentUserId = $state("");
    let activeTab = $state("ongoing"); // 'ongoing', 'completed', 'canceled'

    onMount(async () => {
        currentRole = localStorage.getItem("userRole") || "client";
        
        let checkUser = setInterval(async () => {
            if (typeof window !== 'undefined' && (window as any).Clerk) {
                clearInterval(checkUser);
                const user = (window as any).Clerk.user;
                if (user) {
                    currentUserId = user.id;
                    await loadTrips();
                } else {
                    goto("/login");
                }
            }
        }, 50);

        setTimeout(() => {
            clearInterval(checkUser);
            if (isLoading) isLoading = false;
        }, 3000);
    });

    async function loadTrips() {
        isLoading = true;
        try {
            let url = `/api/trips`;
            if (currentRole === "admin") {
                url += `?role=admin`;
            } else if (currentRole === "FORWARDER" || currentRole === "employee") {
                url += `?forwarderId=${currentUserId}`;
            } else {
                url += `?customerId=${currentUserId}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                trips = result.data || [];
            }
        } catch (e) {
            console.error("Failed to load trips:", e);
        } finally {
            isLoading = false;
        }
    }

    let filteredTrips = $derived(() => {
        return trips.filter((t: any) => {
            const driverBid = (currentRole === 'FORWARDER' || currentRole === 'employee') ? t.bids?.find((b: any) => b.forwarderId === currentUserId) : null;
            const isLost = driverBid && ((t.forwarderId && t.forwarderId !== currentUserId) || (driverBid.status === 'REJECTED_BY_CLIENT'));
            
            if (activeTab === "ongoing") {
                if (isLost) return false;
                return ["Reviewing", "Pending Client Approval", "Pending Pickup", "In Transit", "Delivery Protocol"].includes(t.status);
            } else if (activeTab === "completed") {
                if (isLost) return true;
                return t.status === "Completed";
            } else if (activeTab === "canceled") {
                return t.status === "Canceled";
            }
            return false;
        });
    });

    async function cancelTrip(id: string) {
        if (!confirm("Are you sure you want to cancel this trip?")) return;
        try {
            const response = await fetch(`/api/jobs/${id}/cancel`, {
                method: "PATCH",
            });
            if (response.ok) {
                trips = trips.map((t) => (t.id === id ? { ...t, status: "Canceled" } : t));
                alert("Trip canceled successfully.");
            } else {
                alert("Failed to cancel trip.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        }
    }

    async function deleteTrip(id: string) {
        if (!confirm("Are you sure you want to delete this trip record permanently? This action cannot be undone.")) return;
        try {
            const response = await fetch(`/api/jobs/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                trips = trips.filter((t) => t.id !== id);
                alert("Trip record deleted successfully.");
            } else {
                alert("Failed to delete trip record.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        }
    }

    function openDriverTracker(trip: any) {
        localStorage.setItem("activeTransitJob", JSON.stringify(trip));
        goto("/jobs/active");
    }

    async function clientAcceptBid(tripId: string, bidId: string) {
        if (!confirm("Are you sure you want to lock in this driver and rate?")) return;
        try {
            const response = await fetch(`/api/jobs/${tripId}/bids/${bidId}/client-accept`, { method: "PATCH" });
            if (response.ok) {
                alert("Driver confirmed! The job is now active.");
                loadTrips();
            } else {
                alert("Failed to confirm driver.");
            }
        } catch (e) {
            alert("Network error");
        }
    }

    async function clientRejectBid(tripId: string, bidId: string) {
        if (!confirm("Are you sure you want to decline this rate and wait for other drivers?")) return;
        try {
            const response = await fetch(`/api/jobs/${tripId}/bids/${bidId}/client-reject`, { method: "PATCH" });
            if (response.ok) {
                alert("Rate declined. Waiting for new bids.");
                loadTrips();
            } else {
                alert("Failed to decline rate.");
            }
        } catch (e) {
            alert("Network error");
        }
    }

    function getDisplayStatus(status: string): string {
        switch (status) {
            case "Reviewing": return "Awaiting Bids";
            case "Pending Client Approval": return "Awaiting Final Approval";
            case "Pending Pickup": return "Driver Assigned";
            case "In Transit": return "In Transit";
            case "Delivery Protocol": return "Verification";
            case "Completed": return "Completed";
            case "Canceled": return "Canceled";
            default: return status;
        }
    }

    function getStatusClass(status: string): string {
        switch (status) {
            case "Completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Canceled":
                return "bg-red-50 text-red-600 border-red-200";
            case "In Transit":
            case "Delivery Protocol":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Pending Client Approval":
                return "bg-yellow-100 text-yellow-800 border-yellow-600";
            default:
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
</script>

<svelte:head>
    <title>Trips Dashboard | ShutUP Forwarder</title>
</svelte:head>

<div class="mx-auto w-full max-w-7xl min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <header class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Trips Dashboard</h1>
        <p class="mt-1 text-sm font-medium text-slate-500">
            {#if currentRole === 'admin'}
                Overview of all transport jobs in the ShutUP Forwarder registry.
            {:else if currentRole === 'FORWARDER' || currentRole === 'employee'}
                View and manage your active deliveries and trip history.
            {:else}
                Track and review your requested transport bookings.
            {/if}
        </p>
    </header>

    <div class="mb-8 flex flex-wrap gap-3 border-b-2 border-slate-200 pb-2">
        <button class="rounded-lg px-5 py-2 text-sm font-bold transition" class:text-blue-600={activeTab === 'ongoing'} class:bg-white={activeTab === 'ongoing'} class:shadow-sm={activeTab === 'ongoing'} class:text-slate-500={activeTab !== 'ongoing'} onclick={() => activeTab = 'ongoing'}>Ongoing Trips</button>
        <button class="rounded-lg px-5 py-2 text-sm font-bold transition" class:text-blue-600={activeTab === 'completed'} class:bg-white={activeTab === 'completed'} class:shadow-sm={activeTab === 'completed'} class:text-slate-500={activeTab !== 'completed'} onclick={() => activeTab = 'completed'}>Completed Trips</button>
        <button class="rounded-lg px-5 py-2 text-sm font-bold transition" class:text-blue-600={activeTab === 'canceled'} class:bg-white={activeTab === 'canceled'} class:shadow-sm={activeTab === 'canceled'} class:text-slate-500={activeTab !== 'canceled'} onclick={() => activeTab = 'canceled'}>Canceled Trips</button>
    </div>

    {#if isLoading}
        <div class="py-16 text-center text-slate-500">
            <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p>Syncing trips database...</p>
        </div>
    {:else if filteredTrips().length === 0}
        <div class="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <span class="mb-4 block text-5xl">📦</span>
            <h3 class="text-xl font-extrabold">No trips found</h3>
            <p class="mt-2 text-slate-500">There are no trips under the "{activeTab}" category.</p>
        </div>
    {:else}
        <div class="space-y-4">
            <div class="hidden grid-cols-[100px_1.5fr_2fr_1fr_1fr_1fr] items-center border-b border-slate-300 px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500 md:grid">
                <div>Trip ID</div><div>Vehicle</div><div>Route</div><div>Target Budget</div><div>Status</div><div class="text-right">Actions</div>
            </div>
            {#each filteredTrips() as trip (trip.id)}
                {@const driverBid = (currentRole === 'FORWARDER' || currentRole === 'employee') ? trip.bids?.find((b: any) => b.forwarderId === currentUserId) : null}
                {@const isLost = driverBid && trip.forwarderId && trip.forwarderId !== currentUserId}
                {@const isRejected = driverBid && driverBid.status === 'REJECTED_BY_CLIENT'}
                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md md:grid md:grid-cols-[100px_1.5fr_2fr_1fr_1fr_1fr] md:items-center md:gap-4 md:px-6">
                    <div><span class="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">SF-{trip.jobNumber}</span></div>
                    <div class="mt-3 flex flex-col md:mt-0">
                        <span class="text-sm font-bold text-slate-900">{trip.make} {trip.model}</span>
                        <span class="text-xs text-slate-500">{trip.year} · Distance: {trip.distance || 'Calc Pending'}</span>
                    </div>
                    <div class="mt-3 text-sm font-semibold text-slate-700 md:mt-0">{trip.pickup.split(',')[0]} ➔ {trip.delivery.split(',')[0]}</div>
                    <div class="mt-3 text-lg font-extrabold text-blue-900 md:mt-0">€{trip.targetPrice || 500}</div>
                    <div class="mt-3 md:mt-0">
                        {#if isLost || isRejected}
                            <StatusBadge tone="danger" extraClass="text-red-800">Not Selected</StatusBadge>
                        {:else if driverBid && driverBid.status === 'AWAITING_CLIENT_APPROVAL'}
                            <StatusBadge tone="warning" extraClass="border-yellow-600 bg-yellow-100 text-yellow-800">Awaiting Client Final Approval</StatusBadge>
                        {:else}
                            <StatusBadge extraClass={getStatusClass(trip.status)}>{getDisplayStatus(trip.status)}</StatusBadge>
                        {/if}
                    </div>
                    <div class="mt-4 flex flex-wrap justify-start gap-2 md:mt-0 md:justify-end">
                        {#if (currentRole === 'FORWARDER' || currentRole === 'employee') && ['Pending Pickup', 'In Transit', 'Delivery Protocol'].includes(trip.status)}
                            <Button variant="primary" size="sm" onclick={() => openDriverTracker(trip)}>Pickup</Button>
                        {/if}
                        {#if trip.status !== 'Completed' && trip.status !== 'Canceled'}
                            <Button href={`/submit/tracking?id=${trip.id}`} variant="outline" size="sm">Track</Button>
                        {/if}
                        {#if currentRole === 'admin' && ['Completed', 'Canceled'].includes(trip.status)}
                            <Button variant="outline" size="sm" extraClass="border-red-300 bg-red-50 text-red-600 hover:bg-red-100" onclick={() => deleteTrip(trip.id)}>Delete</Button>
                        {/if}
                        {#if ['Reviewing', 'Pending Client Approval', 'Pending Pickup'].includes(trip.status)}
                            <Button variant="outline" size="sm" extraClass="border-red-300 bg-red-50 text-red-600 hover:bg-red-100" onclick={() => cancelTrip(trip.id)}>Cancel</Button>
                        {/if}
                    </div>

                    {#if trip.status === 'Pending Client Approval' && (currentRole === 'CUSTOMER' || currentRole === 'client')}
                        {#if trip.bids && trip.bids.some((b: any) => b.status === 'AWAITING_CLIENT_APPROVAL')}
                            {#each trip.bids.filter((b: any) => b.status === 'AWAITING_CLIENT_APPROVAL') as pendingBid}
                                <div class="col-span-full mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 md:flex-row md:items-center">
                                    <div>
                                        <h4 class="text-lg font-bold text-yellow-800">Action Required: Finalize Rate</h4>
                                        <p class="mt-1 text-sm text-yellow-700">Driver <strong>{pendingBid.driverName}</strong> agreed to <strong>€{pendingBid.aiCounterAmount}</strong>. Please confirm to dispatch this driver.</p>
                                    </div>
                                    <div class="flex w-full gap-2 md:w-auto">
                                        <Button variant="outline" size="sm" extraClass="flex-1 md:flex-none" onclick={() => clientRejectBid(trip.id, pendingBid.id)}>Decline</Button>
                                        <Button variant="warning" size="sm" extraClass="flex-1 md:flex-none" onclick={() => clientAcceptBid(trip.id, pendingBid.id)}>Accept €{pendingBid.aiCounterAmount}</Button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    {/if}

                    {#if trip.status === 'Completed'}
                        <div class={`col-span-full mt-3 rounded-lg border p-3 text-sm font-semibold ${trip.aiReasoning && trip.aiReasoning.includes('Flagged') ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                            {trip.aiReasoning || "✅ System Cleared: No Damage Detected Vehicle matches original condition. Job complete."}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
