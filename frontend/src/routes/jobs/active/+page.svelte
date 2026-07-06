<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    

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

<div class="mx-auto w-full max-w-4xl min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Active Load Tracker</h1>
            <p class="mt-1 text-sm font-medium text-slate-500">
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
        <Button href="/jobs" variant="outline">← Exit</Button>
    </header>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-2xl font-extrabold">{activeJob.make} {activeJob.model}</h2>
            {#if activeJob.status === "pending_pickup"}
                <StatusBadge tone="warning">Awaiting Pickup</StatusBadge>
            {:else if activeJob.status === "in_transit"}
                <StatusBadge tone="info">In Transit</StatusBadge>
            {:else if activeJob.status === "resolved"}
                <StatusBadge tone="success">Completed</StatusBadge>
            {:else}
                <StatusBadge tone="warning">Verification</StatusBadge>
            {/if}
        </div>

        {#if activeJob.status === "pending_pickup"}
            <h3 class="text-lg font-bold">Step 1: Pickup Protocol</h3>
            <p class="mb-5 text-sm font-medium text-slate-500">Capture 4 angles to verify pre-existing condition.</p>
            <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {#each pickupPhotos as photo, i}
                    <button
                        class="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm font-semibold transition"
                        class:border-emerald-500={photo.uploaded}
                        class:bg-emerald-50={photo.uploaded}
                        class:text-emerald-600={photo.uploaded}
                        class:border-slate-400={!photo.uploaded}
                        class:bg-slate-50={!photo.uploaded}
                        class:text-slate-600={!photo.uploaded}
                        class:hover:border-blue-500={!photo.uploaded}
                        class:hover:text-blue-600={!photo.uploaded}
                        onclick={() => simulatePickupUpload(i)}
                        disabled={photo.uploaded}
                    >
                        <span class="text-2xl">{photo.uploaded ? "✅" : "📷"}</span>
                        <span>{photo.uploaded ? `${photo.label} Locked` : `Capture ${photo.label}`}</span>
                    </button>
                {/each}
            </div>
            <Button variant="primary" size="lg" disabled={!allPickupUploaded} onclick={completePickup} extraClass="w-full">
                {allPickupUploaded ? "Lock Photos & Start Transit" : "Upload all photos to continue..."}
            </Button>

        {:else if activeJob.status === "in_transit"}
            <div class="py-8 text-center">
                <div class="mb-3 text-6xl">🚚</div>
                <h2 class="text-2xl font-extrabold text-sky-700">Transit Initiated</h2>
                <p class="mt-2 mb-6 font-medium text-slate-600">GPS tracking active. Proceed to {activeJob.delivery}.</p>
                <Button variant="primary" size="lg" extraClass="w-full" onclick={arriveAtDelivery}>📍 I have arrived at Drop-off</Button>
            </div>

        {:else if activeJob.status === "delivery_protocol"}
            <h3 class="text-lg font-bold">Step 2: Delivery Verification</h3>
            <p class="mb-5 text-sm font-medium text-slate-500">Capture final photos for AI damage comparison.</p>
            <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {#each deliveryPhotos as photo, i}
                    <button
                        class="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm font-semibold transition"
                        class:border-emerald-500={photo.uploaded}
                        class:bg-emerald-50={photo.uploaded}
                        class:text-emerald-600={photo.uploaded}
                        class:border-slate-400={!photo.uploaded}
                        class:bg-slate-50={!photo.uploaded}
                        class:text-slate-600={!photo.uploaded}
                        class:hover:border-blue-500={!photo.uploaded}
                        class:hover:text-blue-600={!photo.uploaded}
                        onclick={() => simulateDeliveryUpload(i)}
                        disabled={photo.uploaded}
                    >
                        <span class="text-2xl">{photo.uploaded ? "✅" : "📸"}</span>
                        <span>{photo.uploaded ? `${photo.label} Locked` : `Capture ${photo.label}`}</span>
                    </button>
                {/each}
            </div>

            {#if allDeliveryUploaded}
                <div class="rounded-xl border border-dashed border-purple-300 bg-purple-50 p-4">
                    <p class="mb-3 text-xs font-bold uppercase tracking-wide text-purple-700">Developer Test: Choose AI Outcome</p>
                    <div class="grid gap-3 sm:grid-cols-2">
                        <Button variant="success" size="lg" onclick={() => runAIAnalysis("cleared")}>Simulate: No Damage</Button>
                        <Button variant="danger" size="lg" onclick={() => runAIAnalysis("damage_detected")}>Simulate: Damage Found</Button>
                    </div>
                </div>
            {/if}

        {:else if activeJob.status === "ai_analyzing"}
            <div class="py-12 text-center">
                <div class="mb-4 inline-block text-6xl animate-pulse">🤖</div>
                <h2 class="text-2xl font-extrabold">AI is comparing pixels...</h2>
                <p class="mt-2 font-medium text-slate-600">Cross-referencing pickup and delivery conditions.</p>
            </div>

        {:else if activeJob.status === "resolved"}
            {#if aiAssessmentResult === "cleared"}
                <div class="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-700">
                    <strong class="block text-lg">✅ AI Cleared: No Damage Detected</strong>
                    <p class="text-sm font-medium">Vehicle matches original condition. Job complete.</p>
                </div>
            {:else}
                <div class="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                    <strong class="block text-lg">⚠️ AI Flagged: Damage Detected</strong>
                    <p class="text-sm font-medium">New scratch detected on Left Side. Automated insurance claim filed.</p>
                </div>
            {/if}

            <div class="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                    <h4 class="mb-3 border-b border-slate-300 pb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Pickup (Before)</h4>
                    <div class="grid grid-cols-2 gap-2">
                        {#each pickupPhotos as p}
                            <div class="rounded-lg border border-slate-300 bg-white px-2 py-3 text-center text-xs font-bold text-slate-600">{p.label}</div>
                        {/each}
                    </div>
                </div>
                <div>
                    <h4 class="mb-3 border-b border-slate-300 pb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Delivery (After)</h4>
                    <div class="grid grid-cols-2 gap-2">
                        {#each deliveryPhotos as p}
                            <div class={`rounded-lg bg-white px-2 py-3 text-center text-xs font-bold ${aiAssessmentResult === 'damage_detected' && p.label === 'Left Side' ? 'border-2 border-red-500 bg-red-50 text-red-600' : 'border border-slate-300 text-slate-600'}`}>{p.label}</div>
                        {/each}
                    </div>
                </div>
            </div>

            {#if aiAssessmentResult === "cleared"}
                <Button variant="primary" size="lg" extraClass="mt-6 w-full" disabled={isCompleting} onclick={finalizeJob}>
                    {isCompleting ? "Finalizing..." : "Finalize & Return to Board"}
                </Button>
            {:else}
                <Button variant="danger" size="lg" extraClass="mt-6 w-full" disabled={isCompleting} onclick={finalizeJob}>
                    {isCompleting ? "Filing Claim..." : "Acknowledge Claim & Return"}
                </Button>
            {/if}
        {/if}
    </div>
</div>
