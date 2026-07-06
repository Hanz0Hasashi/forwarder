<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    

    let job = $state<any>(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const queryJobId = urlParams.get("id");
        const jobId = queryJobId || sessionStorage.getItem("shutup-live-job-id");

        if (jobId) {
            try {
                const response = await fetch(`/api/jobs/${jobId}`);
                if (response.ok) {
                    const result = await response.json();
                    job = result.data;
                } else {
                    errorMessage = "Job not found in database.";
                }
            } catch (e) {
                console.error("Database connection error:", e);
                errorMessage = "Connection offline.";
            } finally {
                isLoading = false;
            }
        } else {
            errorMessage = "No active job found.";
            isLoading = false;
        }
    });

    async function cancelBooking() {
        if (!job || !confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            const response = await fetch(`/api/jobs/${job.id}/cancel`, {
                method: "PATCH"
            });
            if (response.ok) {
                const result = await response.json();
                job.status = "Canceled";
                alert("Booking canceled successfully!");
            } else {
                alert("Failed to cancel booking.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        }
    }

    // Helper to get progress percentage
    function getProgressPercent(status: string): number {
        switch (status) {
            case "Reviewing": return 0;
            case "Pending Pickup": return 15;
            case "In Transit": return 55;
            case "Delivery Protocol": return 85;
            case "Completed": return 100;
            case "Canceled": return 0;
            default: return 0;
        }
    }

    function getDisplayStatus(status: string): string {
        switch (status) {
            case "Reviewing": return "Intake Review";
            case "Pending Pickup": return "Driver Matched";
            case "In Transit": return "In Transit";
            case "Delivery Protocol": return "Verification";
            case "Completed": return "Delivered";
            case "Canceled": return "Canceled";
            default: return status;
        }
    }
</script>

<svelte:head>
    <title>Live Tracking | ShutUP Forwarder</title>
</svelte:head>

<section class="wizard-section">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 wizard-container">
        {#if isLoading}
            <div class="wizard-card text-center py-20 space-y-4">
                <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p class="text-slate-500 font-semibold">Retrieving shipping parameters...</p>
            </div>
        {:else if errorMessage || !job}
            <div class="wizard-card text-center py-16">
                <span class="text-4xl">⚠️</span>
                <h2 class="text-xl font-bold text-slate-800 mt-4">{errorMessage || "Job not found"}</h2>
                <p class="text-slate-500 mt-2">Could not retrieve tracking details for this load.</p>
                <Button href="/" variant="primary" extraClass="mt-6 rounded-full">Return to Dashboard</Button>
            </div>
        {:else}
            <div class="wizard-header">
                <Button href="/trips" variant="outline" size="sm" extraClass="rounded-full">← Back to Trips</Button>
                <div class="step-indicator" 
                     class:success-indicator={job.status === 'Completed' || job.status === 'Pending Pickup'} 
                     class:danger-indicator={job.status === 'Canceled'}>
                    {getDisplayStatus(job.status)} {job.status === 'Completed' ? '✅' : ''}
                </div>
            </div>

            <!-- Completed Banner -->
            {#if job.status === 'Completed'}
                <div class="banner-success animate-fade-in">
                    <span class="banner-icon">🎉</span>
                    <div class="banner-body">
                        <h4>Delivery Complete!</h4>
                        <p>Your vehicle has been successfully delivered and verified with zero additional damage reported.</p>
                    </div>
                </div>
            {:else if job.status === 'Canceled'}
                <div class="banner-danger animate-fade-in">
                    <span class="banner-icon">❌</span>
                    <div class="banner-body">
                        <h4>Trip Canceled</h4>
                        <p>This trip has been canceled and is no longer active.</p>
                    </div>
                </div>
            {/if}

            <div class="wizard-card tracking-card">
                <div class="job-header">
                    <div class="job-id">Tracking: SF-{job.jobNumber}</div>
                    <h2 class="car-name">{job.make} {job.model} · {job.year}</h2>
                </div>

                <div class="route-map" class:grayed={job.status === 'Canceled'}>
                    <div class="map-point">
                        <div class="point-dot active"></div>
                        <div class="point-label">{job.pickup.split(",")[0]}</div>
                        <div class="point-sub">(Origin)</div>
                    </div>
                    <div class="map-line">
                        <div class="line-progress" style="width: {getProgressPercent(job.status)}%"></div>
                        <div class="car-icon" style="left: calc({getProgressPercent(job.status)}% - 12px)">🚗</div>
                    </div>
                    <div class="map-point">
                        <div class="point-dot" class:active={job.status === 'Completed'}></div>
                        <div class="point-label">{job.delivery.split(",")[0]}</div>
                        <div class="point-sub">(Destination)</div>
                    </div>
                </div>

                <hr class="divider" />

                <div class="timeline">
                    <!-- Step 1: Booked -->
                    <div class="time-item done">
                        <div class="time-dot">✅</div>
                        <div class="time-content">
                            <strong>Job Booked</strong> — Vehicle specifications registered.
                        </div>
                    </div>

                    <!-- Step 2: Intake AI Review -->
                    {#if job.status === 'Reviewing'}
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>System Review Complete</strong> — Condition photos scanned & pricing calculated.
                            </div>
                        </div>
                        <div class="time-item current">
                            <div class="time-dot pulse">⏳</div>
                            <div class="time-content">
                                <strong>Awaiting Driver Match</strong> — System negotiating with local transporters.
                            </div>
                        </div>
                        <div class="time-item future">
                            <div class="time-dot">○</div>
                            <div class="time-content">
                                <strong>En Route</strong> — GPS transit updates.
                            </div>
                        </div>
                    {:else if job.status === 'Pending Pickup'}
                        <!-- Step 3: Pending Pickup -->
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>Verification Passed</strong> — Baseline condition profile locked.
                            </div>
                        </div>
                        <div class="time-item current">
                            <div class="time-dot pulse">🚛</div>
                            <div class="time-content">
                                <strong>Awaiting Pickup</strong> — Driver matched. Scheduled for collection.
                            </div>
                        </div>
                        <div class="time-item future">
                            <div class="time-dot">○</div>
                            <div class="time-content">
                                <strong>En Route</strong> — GPS transit updates.
                            </div>
                        </div>
                    {:else if job.status === 'In Transit'}
                        <!-- Step 4: In Transit -->
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>Transporter Dispatched</strong> — Vehicle picked up.
                            </div>
                        </div>
                        <div class="time-item current">
                            <div class="time-dot pulse">📍</div>
                            <div class="time-content">
                                <strong>En Route</strong> — Vehicle in transit to {job.delivery.split(",")[0]}.
                            </div>
                        </div>
                        <div class="time-item future">
                            <div class="time-dot">○</div>
                            <div class="time-content">
                                <strong>Drop-off Verification</strong> — Comparative photo analysis.
                            </div>
                        </div>
                    {:else if job.status === 'Delivery Protocol'}
                        <!-- Step 5: Delivery Protocol -->
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>Arrived at Destination</strong> — Transporter at drop-off coordinates.
                            </div>
                        </div>
                        <div class="time-item current">
                            <div class="time-dot pulse">📸</div>
                            <div class="time-content">
                                <strong>System Inspection Active</strong> — Comparing pickup & delivery condition states.
                            </div>
                        </div>
                        <div class="time-item future">
                            <div class="time-dot">○</div>
                            <div class="time-content">
                                <strong>Completed</strong> — Final checkout clear.
                            </div>
                        </div>
                    {:else if job.status === 'Completed'}
                        <!-- Step 6: Completed -->
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>Arrived & Inspected</strong> — Condition checked by System.
                            </div>
                        </div>
                        <div class="time-item done">
                            <div class="time-dot">✅</div>
                            <div class="time-content">
                                <strong>Delivered & Complete</strong> — Vehicle signed off. Job completed.
                            </div>
                        </div>
                    {:else if job.status === 'Canceled'}
                        <!-- Canceled State -->
                        <div class="time-item canceled">
                            <div class="time-dot">❌</div>
                            <div class="time-content" style="color: #ef4444;">
                                <strong>Trip Canceled</strong> — Shipment has been aborted.
                            </div>
                        </div>
                    {/if}
                </div>

                <hr class="divider" />

                <!-- Driver Card -->
                <div class="driver-card">
                    {#if job.forwarder}
                        <div class="driver-info">
                            <div class="driver-avatar">🚛</div>
                            <div class="driver-details">
                                <h3>{job.forwarder.name || 'Verified Transporter'}</h3>
                                <div class="driver-stats">
                                    <span class="stars">★★★★★</span>
                                    4.9 · 186 successful loads
                                </div>
                            </div>
                        </div>
                        <div class="driver-update">
                            <span class="update-time">Current Assignment Status</span>
                            <p>"{job.status === 'Completed' ? 'Delivery protocol successfully finalized.' : 'Assigned to your load and heading to pickup location.'}"</p>
                        </div>
                        <div class="driver-actions">
                            <button class="action-btn call-btn">📞 Contact</button>
                            <button class="action-btn msg-btn">💬 Chat</button>
                        </div>
                    {:else if job.status === 'Canceled'}
                        <div class="text-center text-slate-400 py-4 font-semibold">
                            Trip Canceled. No driver assigned.
                        </div>
                    {:else}
                        <div class="driver-info">
                            <div class="driver-avatar">⚙️</div>
                            <div class="driver-details">
                                <h3>Automated Dispatch</h3>
                                <div class="driver-stats">
                                    Awaiting driver bids (Target Price: €{job.targetPrice})
                                </div>
                            </div>
                        </div>
                        <div class="driver-update">
                            <span class="update-time">System Status</span>
                            <p>"Broadcasting shipment data to regional carriers. Bidding negotiations active."</p>
                        </div>
                        {#if job.status === 'Reviewing' || job.status === 'Pending Pickup'}
                            <div class="mt-4">
                                <Button onclick={cancelBooking} variant="outline" size="lg" extraClass="w-full rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                                    ❌ Cancel Transport Booking
                                </Button>
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</section>

<style>
    /* Premium Light Theme Styles */
    .wizard-section {
        min-height: 100vh;
        background: var(--app-bg);
        color: var(--text-strong);
        padding: var(--wizard-pad-y) var(--wizard-pad-x);
        font-family: "Inter", system-ui, sans-serif;
    }

    .wizard-container {
        max-width: var(--wizard-max-width);
        margin: 0 auto;
    }

    .wizard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    .step-indicator {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-label);
        box-shadow: var(--shadow-chip);
    }
    .success-indicator {
        background: var(--success-soft);
        border-color: var(--success-border);
        color: var(--success-text);
    }
    .danger-indicator {
        background: var(--danger-soft);
        border-color: var(--danger-border);
        color: var(--danger-text);
    }

    .wizard-card {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-card);
        padding: 40px;
        box-shadow: var(--shadow-card);
    }

    .job-header {
        text-align: center;
        margin-bottom: 32px;
    }
    .job-id {
        color: var(--text-muted);
        font-size: 0.95rem;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .car-name {
        font-size: 1.6rem;
        font-weight: 800;
        margin: 0;
        color: var(--text-strong);
    }

    .divider {
        border: 0;
        height: 1px;
        background: var(--border-soft);
        margin: 28px 0;
    }

    .route-map {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 10px 0;
        transition: opacity 0.3s;
    }
    .route-map.grayed {
        opacity: 0.4;
        filter: grayscale(1);
    }
    .map-point {
        text-align: center;
        flex: 0 0 140px;
    }
    .point-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #cbd5e1;
        border: 4px solid #ffffff;
        margin: 0 auto 10px;
        z-index: 2;
        position: relative;
    }
    .point-dot.active {
        background: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }
    .point-label {
        font-weight: 700;
        font-size: 0.95rem;
        color: #0f172a;
        line-height: 1.3;
    }
    .point-sub {
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 500;
        margin-top: 4px;
    }

    .map-line {
        flex: 1;
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        position: relative;
        margin: 7px -20px 0;
        z-index: 1;
    }
    .line-progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        border-radius: 2px;
        transition: width 0.4s ease;
    }
    .car-icon {
        position: absolute;
        top: -14px;
        transform: translateX(-50%);
        font-size: 1.5rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        transition: left 0.4s ease;
    }

    /* Timeline */
    .timeline {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 0 10px;
    }
    .time-item {
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }
    .time-dot {
        font-size: 1.1rem;
        width: 24px;
        text-align: center;
    }
    .time-content {
        color: #475569;
        font-size: 0.95rem;
        line-height: 1.4;
        padding-top: 2px;
    }
    .time-content strong {
        color: #0f172a;
    }

    .time-item.current .time-content {
        color: #2563eb;
        font-weight: 600;
    }
    .time-item.future .time-content {
        color: #94a3b8;
    }
    .pulse {
        animation: pulse-anim 2s infinite;
        display: inline-block;
    }

    /* Driver Card */
    .driver-card {
        background: #f8fafc;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid #cbd5e1;
    }
    .driver-info {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 20px;
    }
    .driver-avatar {
        font-size: 2.5rem;
        background: #e2e8f0;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .driver-details h3 {
        margin: 0 0 6px 0;
        font-size: 1.15rem;
        color: #0f172a;
        font-weight: 800;
    }
    .driver-stats {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 600;
    }
    .stars {
        color: #f59e0b;
        letter-spacing: 2px;
    }

    .driver-update {
        background: #ffffff;
        padding: 16px;
        border-radius: 10px;
        margin-bottom: 20px;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #3b82f6;
    }
    .update-time {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 6px;
        font-weight: 700;
    }
    .driver-update p {
        margin: 0;
        font-size: 0.95rem;
        color: #334155;
        font-style: italic;
        font-weight: 500;
    }

    .driver-actions {
        display: flex;
        gap: 12px;
    }
    .action-btn {
        flex: 1;
        padding: 14px;
        border-radius: 10px;
        border: 1px solid transparent;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
    }

    .call-btn {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #334155;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .call-btn:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
    }

    .msg-btn {
        background: #2563eb;
        color: white;
        box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }
    .msg-btn:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px -2px rgba(37, 99, 235, 0.3);
    }

    /* Banners styling */
    .banner-success {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 4px 6px -1px rgba(24, 120, 50, 0.05);
    }
    .banner-danger {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 4px 6px -1px rgba(120, 24, 24, 0.05);
    }
    .banner-icon {
        font-size: 1.5rem;
    }
    .banner-body h4 {
        margin: 0 0 4px 0;
        font-size: 1rem;
        font-weight: 750;
        color: #111827;
    }
    .banner-body p {
        margin: 0;
        font-size: 0.9rem;
        color: #4b5563;
        line-height: 1.4;
    }

    @keyframes pulse-anim {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.8;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    @media (max-width: 600px) {
        .wizard-card {
            padding: 30px 20px;
        }
        .wizard-section {
            padding: 30px 15px;
        }
        .route-map {
            padding: 10px 0;
        }
        .map-point {
            flex: 0 0 100px;
        }
    }
</style>
