<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    

    // The full lifecycle of a job
    type JobStatus =
        | "pending_pickup"
        | "in_transit"
        | "delivery_protocol"
        | "ai_analyzing"
        | "resolved";

    // Start with empty placeholders so Svelte doesn't crash before loading
    let activeJob = $state({
        id: "",
        make: "",
        model: "",
        pickup: "",
        delivery: "",
        payout: "₹5,000",
        status: "pending_pickup" as JobStatus,
    });

    // When the page loads, grab the real car from localStorage!
    onMount(() => {
        const savedJob = localStorage.getItem("activeTransitJob");
        if (savedJob) {
            const parsedJob = JSON.parse(savedJob);
            activeJob = {
                id: parsedJob.id || "",
                make: parsedJob.make || parsedJob.vehicleMake || "Unknown Make",
                model:
                    parsedJob.model ||
                    parsedJob.vehicleModel ||
                    "Unknown Model",
                pickup:
                    parsedJob.pickup ||
                    parsedJob.pickupAddress ||
                    "Unknown Pickup",
                delivery:
                    parsedJob.delivery ||
                    parsedJob.deliveryAddress ||
                    "Unknown Delivery",
                payout: parsedJob.payout || "₹5,000",
                status: "pending_pickup",
            };
        } else {
            // If they somehow got here without clicking a job, kick them back
            goto("/jobs");
        }
    });

    let protocolStarted = $state(false);
    let isCompleting = $state(false); // NEW: Tracks the backend loading state

    // Pickup Photos
    let pickupPhotos = $state([
        { label: "Front View", uploaded: false },
        { label: "Rear View", uploaded: false },
        { label: "Left Side", uploaded: false },
        { label: "Right Side", uploaded: false },
    ]);

    // Delivery Photos
    let deliveryPhotos = $state([
        { label: "Front View", uploaded: false },
        { label: "Rear View", uploaded: false },
        { label: "Left Side", uploaded: false },
        { label: "Right Side", uploaded: false },
    ]);

    let allPickupUploaded = $derived(pickupPhotos.every((p) => p.uploaded));
    let allDeliveryUploaded = $derived(deliveryPhotos.every((p) => p.uploaded));

    // AI Assessment State
    let aiAssessmentResult = $state<"cleared" | "damage_detected" | null>(null);

    // --- PICKUP PHASE ---
    function simulatePickupUpload(index: number) {
        setTimeout(() => {
            pickupPhotos[index].uploaded = true;
        }, 600);
    }

    function completePickup() {
        activeJob.status = "in_transit";
    }

    // --- TRANSIT PHASE ---
    function arriveAtDelivery() {
        activeJob.status = "delivery_protocol";
    }

    // --- DELIVERY PHASE ---
    function simulateDeliveryUpload(index: number) {
        setTimeout(() => {
            deliveryPhotos[index].uploaded = true;
        }, 600);
    }

    function runAIAnalysis(forceResult: "cleared" | "damage_detected") {
        activeJob.status = "ai_analyzing";

        // Simulate AI comparing pixels for 2.5 seconds
        setTimeout(() => {
            aiAssessmentResult = forceResult;
            activeJob.status = "resolved";
        }, 2500);
    }

    // NEW: Complete Job Backend Integration
    async function finalizeJob() {
        if (!activeJob.id) {
            alert("Error: Job ID is missing.");
            return;
        }

        isCompleting = true;
        const damageQuery = aiAssessmentResult === "damage_detected" ? "yes" : "no";
        try {
            const response = await fetch(
                `/api/jobs/${activeJob.id}/complete?damage=${damageQuery}`,
                {
                    method: "PATCH",
                },
            );

            if (response.ok) {
                // Clear the active job from local storage so they can accept a new one
                localStorage.removeItem("activeTransitJob");
                alert("Job successfully completed!");
                goto("/jobs");
            } else {
                const errorData = await response.json();
                const message = errorData.detail || errorData.error || "Unknown error";
                alert("Failed to complete job: " + message);
            }
        } catch (error) {
            console.error("Error completing job:", error);
            alert("Network error. Make sure you are connected.");
        } finally {
            isCompleting = false;
        }
    }
</script>

<div class="active-layout">
    <header class="active-header">
        <div>
            <h1>Active Load Tracker</h1>
            <p class="subtitle">
                {#if activeJob.status === "pending_pickup"}
                    Complete pickup protocol.
                {:else if activeJob.status === "in_transit"}
                    En route to destination.
                {:else if activeJob.status === "delivery_protocol"}
                    Final delivery verification.
                {:else}
                    Job resolution.
                {/if}
            </p>
        </div>
        <a href="/jobs" class="btn-outline">← Exit</a>
    </header>

    <div class="job-card">
        <div class="card-header">
            <h2>{activeJob.make} {activeJob.model}</h2>
            {#if activeJob.status === "pending_pickup"}
                <span class="badge badge-warning">Awaiting Pickup</span>
            {:else if activeJob.status === "in_transit"}
                <span class="badge badge-info">In Transit</span>
            {:else if activeJob.status === "resolved"}
                <span class="badge badge-success">Completed</span>
            {:else}
                <span class="badge badge-warning">Verification</span>
            {/if}
        </div>

        {#if activeJob.status === "pending_pickup"}
            <div class="protocol-section reveal-anim">
                <h3>Step 1: Pickup Protocol</h3>
                <p class="sub-text">
                    Capture 4 angles to verify pre-existing condition.
                </p>

                <div class="photo-grid">
                    {#each pickupPhotos as photo, i}
                        <button
                            class="photo-zone"
                            class:uploaded={photo.uploaded}
                            onclick={() => simulatePickupUpload(i)}
                            disabled={photo.uploaded}
                        >
                            {#if photo.uploaded}
                                <span class="check">✅</span>
                                <span>{photo.label} Locked</span>
                            {:else}
                                <span class="camera-icon">📷</span>
                                <span>Capture {photo.label}</span>
                            {/if}
                        </button>
                    {/each}
                </div>
                <button
                    class="btn-primary"
                    disabled={!allPickupUploaded}
                    onclick={completePickup}
                >
                    {allPickupUploaded
                        ? "Lock Photos & Start Transit"
                        : "Upload all photos to continue..."}
                </button>
            </div>
        {:else if activeJob.status === "in_transit"}
            <div class="transit-state reveal-anim">
                <div class="success-icon">🚚</div>
                <h2 class="text-blue">Transit Initiated</h2>
                <p>GPS tracking active. Proceed to {activeJob.delivery}.</p>
                <button class="btn-primary" onclick={arriveAtDelivery}>
                    📍 I have arrived at Drop-off
                </button>
            </div>
        {:else if activeJob.status === "delivery_protocol"}
            <div class="protocol-section reveal-anim">
                <h3>Step 2: Delivery Verification</h3>
                <p class="sub-text">
                    Capture final photos for AI damage comparison.
                </p>

                <div class="photo-grid">
                    {#each deliveryPhotos as photo, i}
                        <button
                            class="photo-zone"
                            class:uploaded={photo.uploaded}
                            onclick={() => simulateDeliveryUpload(i)}
                            disabled={photo.uploaded}
                        >
                            {#if photo.uploaded}
                                <span class="check">✅</span>
                                <span>{photo.label} Locked</span>
                            {:else}
                                <span class="camera-icon">📸</span>
                                <span>Capture {photo.label}</span>
                            {/if}
                        </button>
                    {/each}
                </div>

                {#if allDeliveryUploaded}
                    <div class="test-controls reveal-anim">
                        <p class="test-label">
                            Developer Test: Choose AI Outcome
                        </p>
                        <div class="btn-group">
                            <button
                                class="btn-success"
                                onclick={() => runAIAnalysis("cleared")}
                                >Simulate: No Damage</button
                            >
                            <button
                                class="btn-danger"
                                onclick={() => runAIAnalysis("damage_detected")}
                                >Simulate: Damage Found</button
                            >
                        </div>
                    </div>
                {/if}
            </div>
        {:else if activeJob.status === "ai_analyzing"}
            <div class="analyzing-state reveal-anim">
                <div class="scanner-line"></div>
                <div class="ai-icon pulse">🤖</div>
                <h2>AI is comparing pixels...</h2>
                <p>Cross-referencing pickup and delivery conditions.</p>
            </div>
        {:else if activeJob.status === "resolved"}
            <div class="resolution-state reveal-anim">
                {#if aiAssessmentResult === "cleared"}
                    <div class="alert alert-success">
                        <strong>✅ AI Cleared: No Damage Detected</strong>
                        <p>Vehicle matches original condition. Job complete.</p>
                    </div>
                {:else}
                    <div class="alert alert-danger">
                        <strong>⚠️ AI Flagged: Damage Detected</strong>
                        <p>
                            New scratch detected on Left Side. Automated
                            insurance claim filed.
                        </p>
                    </div>
                {/if}

                <div class="comparison-board">
                    <div class="comparison-column">
                        <h4 class="col-title">Pickup (Before)</h4>
                        <div class="mini-grid">
                            {#each pickupPhotos as p}
                                <div class="mini-photo locked">{p.label}</div>
                            {/each}
                        </div>
                    </div>
                    <div class="comparison-column">
                        <h4 class="col-title">Delivery (After)</h4>
                        <div class="mini-grid">
                            {#each deliveryPhotos as p}
                                <div
                                    class="mini-photo {aiAssessmentResult ===
                                        'damage_detected' &&
                                    p.label === 'Left Side'
                                        ? 'flagged'
                                        : 'locked'}"
                                >
                                    {p.label}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                {#if aiAssessmentResult === "cleared"}
                    <button
                        class="btn-primary mt-4"
                        disabled={isCompleting}
                        onclick={finalizeJob}
                    >
                        {isCompleting
                            ? "Finalizing..."
                            : "Finalize & Return to Board"}
                    </button>
                {:else}
                    <button
                        class="btn-danger mt-4"
                        disabled={isCompleting}
                        onclick={finalizeJob}
                    >
                        {isCompleting
                            ? "Filing Claim..."
                            : "Acknowledge Claim & Return"}
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    /* Premium Light Theme */
    .active-layout {
        padding: 40px 20px;
        background: #f8fafc; /* slate-50 */
        min-height: 100vh;
        color: #0f172a;
        font-family: "Inter", system-ui, sans-serif;
        max-width: 900px;
        margin: 0 auto;
    }

    .active-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }
    .active-header h1 {
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

    .btn-outline {
        background: #ffffff;
        color: #475569;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        transition: all 0.2s;
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .btn-outline:hover {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #94a3b8;
    }

    .job-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
    }
    .card-header h2 {
        margin: 0;
        color: #0f172a;
        font-weight: 800;
    }

    .badge {
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    .badge-warning {
        background: #fffbeb;
        color: #d97706;
        border: 1px solid #fde68a;
    }
    .badge-info {
        background: #f0f9ff;
        color: #0284c7;
        border: 1px solid #bae6fd;
    }
    .badge-success {
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
    }

    /* Protocol Sections */
    .protocol-section h3 {
        margin: 0 0 4px 0;
        color: #0f172a;
        font-weight: 700;
    }
    .sub-text {
        color: #64748b;
        font-size: 0.9rem;
        margin-bottom: 24px;
        font-weight: 500;
    }

    .photo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 32px;
    }
    .photo-zone {
        background: #f8fafc;
        border: 2px dashed #94a3b8;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;
    }
    .photo-zone:hover:not(:disabled) {
        border-color: #2563eb;
        color: #2563eb;
        background: #ffffff;
    }
    .photo-zone.uploaded {
        border-style: solid;
        border-color: #10b981;
        color: #10b981;
        background: #f0fdf4;
        cursor: default;
    }
    .camera-icon,
    .check {
        font-size: 1.5rem;
    }

    /* Buttons */
    .btn-primary {
        width: 100%;
        padding: 16px;
        border: none;
        border-radius: 8px;
        background: #3b82f6;
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .btn-primary:hover:not(:disabled) {
        background: #2563eb;
    }
    .btn-primary:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        border: 1px solid #cbd5e1;
        cursor: not-allowed;
        box-shadow: none;
    }

    .btn-success {
        padding: 14px;
        border: none;
        border-radius: 8px;
        background: #10b981;
        color: white;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
    }
    .btn-success:hover {
        background: #059669;
    }

    .btn-danger {
        padding: 14px;
        border: none;
        border-radius: 8px;
        background: #ef4444;
        color: white;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: background 0.2s;
    }
    .btn-danger:hover:not(:disabled) {
        background: #dc2626;
    }
    .btn-danger:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        border: 1px solid #cbd5e1;
        cursor: not-allowed;
    }
    .btn-group {
        display: flex;
        gap: 16px;
    }

    /* Developer Test Controls */
    .test-controls {
        margin-top: 32px;
        padding: 20px;
        background: #faf5ff;
        border: 1px dashed #d8b4fe;
        border-radius: 12px;
    }
    .test-label {
        color: #9333ea;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        margin-top: 0;
        margin-bottom: 12px;
        letter-spacing: 0.5px;
    }

    /* Transit State */
    .transit-state {
        text-align: center;
        padding: 40px 20px;
    }
    .success-icon {
        font-size: 4rem;
        margin-bottom: 16px;
    }
    .text-blue {
        color: #0284c7;
        font-weight: 800;
    }
    .transit-state p {
        color: #475569;
        margin-bottom: 32px;
        font-weight: 500;
    }

    /* AI Analyzing State */
    .analyzing-state {
        text-align: center;
        padding: 60px 20px;
        position: relative;
        overflow: hidden;
    }
    .analyzing-state h2 {
        color: #0f172a;
        font-weight: 800;
    }
    .analyzing-state p {
        color: #475569;
        font-weight: 500;
    }
    .ai-icon {
        font-size: 4rem;
        margin-bottom: 16px;
        display: inline-block;
    }
    .pulse {
        animation: pulseAnim 1s infinite alternate;
    }
    @keyframes pulseAnim {
        from {
            transform: scale(1);
            opacity: 0.8;
        }
        to {
            transform: scale(1.1);
            opacity: 1;
        }
    }

    /* Resolution State */
    .alert {
        padding: 16px 20px;
        border-radius: 12px;
        margin-bottom: 32px;
    }
    .alert strong {
        display: block;
        font-size: 1.1rem;
        margin-bottom: 4px;
        font-weight: 700;
    }
    .alert p {
        margin: 0;
        font-size: 0.95rem;
        opacity: 0.9;
        font-weight: 500;
    }
    .alert-success {
        background: #ecfdf5;
        border: 1px solid #34d399;
        color: #059669;
    }
    .alert-danger {
        background: #fef2f2;
        border: 1px solid #f87171;
        color: #dc2626;
    }

    .comparison-board {
        display: flex;
        gap: 24px;
        background: #f8fafc;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
    }
    .comparison-column {
        flex: 1;
    }
    .col-title {
        margin: 0 0 16px 0;
        color: #64748b;
        font-size: 0.9rem;
        text-transform: uppercase;
        font-weight: 700;
        text-align: center;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 8px;
    }

    .mini-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .mini-photo {
        background: #ffffff;
        border-radius: 8px;
        padding: 16px 8px;
        text-align: center;
        font-size: 0.75rem;
        color: #475569;
        font-weight: 700;
    }
    .mini-photo.locked {
        border: 1px solid #cbd5e1;
    }
    .mini-photo.flagged {
        border: 2px solid #ef4444;
        color: #ef4444;
        background: #fef2f2;
    }

    .mt-4 {
        margin-top: 32px;
    }
    .reveal-anim {
        animation: slideUp 0.3s ease-out forwards;
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
