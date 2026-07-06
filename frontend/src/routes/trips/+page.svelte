<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    

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
            case "Completed": return "status-completed";
            case "Canceled": return "status-canceled";
            case "In Transit":
            case "Delivery Protocol":
                return "status-transit";
            case "Pending Client Approval":
                return "status-warning";
            default: return "status-pending";
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

<div class="trips-layout">
    <header class="trips-header">
        <div>
            <h1>Trips Dashboard</h1>
            <p class="subtitle">
                {#if currentRole === 'admin'}
                    Overview of all transport jobs in the ShutUP Forwarder registry.
                {:else if currentRole === 'FORWARDER' || currentRole === 'employee'}
                    View and manage your active deliveries and trip history.
                {:else}
                    Track and review your requested transport bookings.
                {/if}
            </p>
        </div>
    </header>

    <!-- Tab Selector -->
    <div class="tabs-container">
        <button class="tab-btn" class:active={activeTab === 'ongoing'} onclick={() => activeTab = 'ongoing'}>
            Ongoing Trips
        </button>
        <button class="tab-btn" class:active={activeTab === 'completed'} onclick={() => activeTab = 'completed'}>
            Completed Trips
        </button>
        <button class="tab-btn" class:active={activeTab === 'canceled'} onclick={() => activeTab = 'canceled'}>
            Canceled Trips
        </button>
    </div>

    <!-- Main List content -->
    {#if isLoading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Syncing trips database...</p>
        </div>
    {:else if filteredTrips().length === 0}
        <div class="empty-state">
            <span class="empty-icon">📦</span>
            <h3>No trips found</h3>
            <p>There are no trips under the "{activeTab}" category.</p>
        </div>
    {:else}
        <div class="trips-list-container animate-fade-in">
            <div class="trips-list-header hidden md:grid">
                <div>Trip ID</div>
                <div>Vehicle</div>
                <div>Route</div>
                <div>Target Budget</div>
                <div>Status</div>
                <div class="text-right">Actions</div>
            </div>
            <div class="trips-list-rows">
                {#each filteredTrips() as trip (trip.id)}
                    {@const driverBid = (currentRole === 'FORWARDER' || currentRole === 'employee') ? trip.bids?.find((b: any) => b.forwarderId === currentUserId) : null}
                    {@const isLost = driverBid && trip.forwarderId && trip.forwarderId !== currentUserId}
                    {@const isRejected = driverBid && driverBid.status === 'REJECTED_BY_CLIENT'}
                    <div class="trip-list-row">
                        <div class="cell-trip-id">
                            <span class="trip-id-tag">SF-{trip.jobNumber}</span>
                        </div>
                        <div class="cell-vehicle">
                            <span class="vehicle-name">{trip.make} {trip.model}</span>
                            <span class="vehicle-meta">{trip.year} · Distance: {trip.distance || 'Calc Pending'}</span>
                        </div>
                        <div class="cell-route">
                            <span class="route-text">{trip.pickup.split(',')[0]} ➔ {trip.delivery.split(',')[0]}</span>
                        </div>
                        <div class="cell-budget">
                            <span class="budget-amount">€{trip.targetPrice || 500}</span>
                        </div>
                        <div class="cell-status">
                            
                            {#if isLost || isRejected}
                                <span class="status-badge status-canceled" style="background: #fee2e2; color: #991b1b; border-color: #fecaca;">
                                    Not Selected
                                </span>
                            {:else if driverBid && driverBid.status === 'AWAITING_CLIENT_APPROVAL'}
                                <span class="status-badge status-warning">
                                    Awaiting Client Final Approval
                                </span>
                            {:else}
                                <span class="status-badge {getStatusClass(trip.status)}">
                                    {getDisplayStatus(trip.status)}
                                </span>
                            {/if}
                        </div>
                        <div class="cell-actions text-right">
                            <div class="flex-actions justify-end">
                                {#if (currentRole === 'FORWARDER' || currentRole === 'employee') && ['Pending Pickup', 'In Transit', 'Delivery Protocol'].includes(trip.status)}
                                    <button onclick={() => openDriverTracker(trip)} class="btn-action btn-primary btn-sm">
                                        Pickup
                                    </button>
                                {/if}
                                {#if trip.status !== 'Completed' && trip.status !== 'Canceled'}
                                    <a href="/submit/tracking?id={trip.id}" class="btn-action btn-outline btn-sm">
                                        Track
                                    </a>
                                {/if}
                                {#if currentRole === 'admin' && ['Completed', 'Canceled'].includes(trip.status)}
                                    <button onclick={() => deleteTrip(trip.id)} class="btn-action btn-danger btn-sm">
                                        Delete
                                    </button>
                                {/if}
                                {#if ['Reviewing', 'Pending Client Approval', 'Pending Pickup'].includes(trip.status)}
                                    <button onclick={() => cancelTrip(trip.id)} class="btn-action btn-danger btn-sm">
                                        Cancel
                                    </button>
                                {/if}
                            </div>
                        </div>

                        <!-- Client Review UI for Pending Bids -->
                        {#if trip.status === 'Pending Client Approval' && (currentRole === 'CUSTOMER' || currentRole === 'client')}
                            {#if trip.bids && trip.bids.some((b: any) => b.status === 'AWAITING_CLIENT_APPROVAL')}
                                {#each trip.bids.filter((b: any) => b.status === 'AWAITING_CLIENT_APPROVAL') as pendingBid}
                                    <div class="col-span-full mt-4 p-4 rounded-xl border border-yellow-300 bg-yellow-50 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h4 class="text-yellow-800 font-bold m-0 text-lg">Action Required: Finalize Rate</h4>
                                            <p class="text-yellow-700 text-sm m-0 mt-1">Driver <strong>{pendingBid.driverName}</strong> agreed to <strong>€{pendingBid.aiCounterAmount}</strong>. Please confirm to dispatch this driver.</p>
                                        </div>
                                        <div class="flex gap-2 w-full md:w-auto">
                                            <button onclick={() => clientRejectBid(trip.id, pendingBid.id)} class="btn-action btn-outline flex-1 md:flex-none" style="background: white;">Decline</button>
                                            <button onclick={() => clientAcceptBid(trip.id, pendingBid.id)} class="btn-action btn-primary flex-1 md:flex-none" style="background: #ca8a04; color: white;">Accept €{pendingBid.aiCounterAmount}</button>
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                        {/if}

                        <!-- Real-time damage logs display if Completed -->
                        {#if trip.status === 'Completed'}
                            <div class="cell-damage-report col-span-full mt-2 p-3 rounded-lg border text-sm font-semibold 
                                 {trip.aiReasoning && trip.aiReasoning.includes('Flagged') 
                                     ? 'bg-red-50 border-red-200 text-red-700' 
                                     : 'bg-emerald-50 border-emerald-200 text-emerald-700'}">
                                {trip.aiReasoning || "✅ System Cleared: No Damage Detected Vehicle matches original condition. Job complete."}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .trips-layout {
        padding: 40px 20px;
        background: #f8fafc;
        min-height: 100vh;
        color: #0f172a;
        font-family: "Inter", system-ui, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
    }

    .trips-header {
        margin-bottom: 32px;
    }
    .trips-header h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 800;
        color: #0f172a;
    }
    .subtitle {
        margin: 4px 0 0 0;
        color: #64748b;
        font-size: 0.95rem;
        font-weight: 500;
    }

    /* Tabs styling */
    .tabs-container {
        display: flex;
        gap: 12px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 8px;
        margin-bottom: 32px;
    }
    .tab-btn {
        background: none;
        border: none;
        padding: 12px 24px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        color: #64748b;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
    }
    .tab-btn:hover {
        color: #0f172a;
    }
    .tab-btn.active {
        color: #2563eb;
        border-bottom-color: #2563eb;
    }

    /* Loading state */
    .loading-state {
        text-align: center;
        padding: 60px 0;
        color: #64748b;
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    }

    /* Empty state */
    .empty-state {
        text-align: center;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 20px;
        padding: 60px 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 16px;
    }
    .empty-state h3 {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
        font-weight: 800;
    }
    .empty-state p {
        margin: 0;
        color: #64748b;
    }

    .trips-list-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .trips-list-header {
        display: grid;
        grid-template-columns: 100px 1.5fr 2fr 1fr 1fr 1fr;
        padding: 12px 24px;
        font-size: 0.75rem;
        font-weight: 850;
        text-transform: uppercase;
        color: #64748b;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #cbd5e1;
        align-items: center;
    }

    .trip-list-row {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px 24px;
        display: grid;
        grid-template-columns: 100px 1.5fr 2fr 1fr 1fr 1fr;
        align-items: center;
        gap: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .trip-list-row:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .cell-trip-id {
        display: flex;
        align-items: center;
    }

    .trip-id-tag {
        font-family: monospace;
        font-weight: 700;
        font-size: 0.85rem;
        background: #f1f5f9;
        color: #475569;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
    }

    .cell-vehicle {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .vehicle-name {
        font-weight: 700;
        color: #0f172a;
        font-size: 0.95rem;
    }

    .vehicle-meta {
        font-size: 0.75rem;
        color: #64748b;
    }

    .cell-route {
        display: flex;
        align-items: center;
    }

    .route-text {
        font-size: 0.9rem;
        font-weight: 700;
        color: #334155;
    }

    .cell-budget {
        display: flex;
        flex-direction: column;
    }

    .budget-amount {
        font-size: 1.15rem;
        font-weight: 800;
        color: #1e3a8a;
    }

    .cell-status {
        display: flex;
        align-items: center;
    }

    .cell-actions {
        display: flex;
        justify-content: flex-end;
    }

    .btn-sm {
        padding: 6px 12px !important;
        font-size: 0.75rem !important;
        border-radius: 8px !important;
        width: auto !important;
        flex: none !important;
    }

    @media (max-width: 768px) {
        .trip-list-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 16px !important;
        }
        .trips-list-header {
            display: none !important;
        }
        .cell-actions {
            justify-content: flex-start !important;
        }
        .justify-end {
            justify-content: flex-start !important;
        }
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    .trip-number {
        font-weight: 800;
        color: #64748b;
        font-size: 0.9rem;
    }
    .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    .status-pending {
        background: #fffbeb;
        color: #d97706;
    }
    .status-warning {
        background: #fef08a;
        color: #854d0e;
        border: 1px solid #ca8a04;
    }
    .status-transit {
        background: #eff6ff;
        color: #2563eb;
    }
    .status-completed {
        background: #f0fdf4;
        color: #16a34a;
    }
    .status-canceled {
        background: #fef2f2;
        color: #ef4444;
    }

    .meta {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 16px;
    }

    /* Route info */
    .route-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
        border-left: 2px dashed #cbd5e1;
        padding-left: 14px;
        margin-left: 6px;
    }
    .route-point {
        position: relative;
        display: flex;
        align-items: center;
    }
    .dot {
        position: absolute;
        left: -21px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #cbd5e1;
        border: 2px solid #ffffff;
    }
    .pickup-dot {
        background: #3b82f6;
    }
    .delivery-dot {
        background: #10b981;
    }

    /* Price / Date info */
    .price-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        background: #f8fafc;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
    }
    .price-value {
        font-size: 1.15rem;
        font-weight: 800;
        color: #1e3a8a;
    }
    .date-value {
        font-size: 0.9rem;
        font-weight: 700;
        color: #334155;
    }

    /* Actions */
    .card-footer {
        margin-top: 24px;
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;
    }
    .flex-actions {
        display: flex;
        gap: 10px;
        width: 100%;
    }
    .btn-action {
        flex: 1;
        text-align: center;
        padding: 12px;
        font-size: 0.9rem;
        font-weight: 700;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
        display: inline-block;
        text-decoration: none;
    }
    .btn-primary {
        background: #2563eb;
        color: #ffffff;
        width: 100%;
        border: none;
    }
    .btn-primary:hover {
        background: #1d4ed8;
    }
    .btn-outline {
        background: #ffffff;
        color: #475569;
        border-color: #cbd5e1;
    }
    .btn-outline:hover {
        background: #f8fafc;
        border-color: #94a3b8;
    }
    .btn-danger {
        background: #fef2f2;
        color: #ef4444;
        border-color: #fca5a5;
    }
    .btn-danger:hover {
        background: #fee2e2;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.25s ease-out forwards;
    }
</style>
