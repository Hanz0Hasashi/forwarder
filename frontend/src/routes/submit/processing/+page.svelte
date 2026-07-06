<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    // State to hold our retrieved data
    let jobData = $state({
        make: "Unknown Vehicle",
        pickup: "Origin",
        delivery: "Destination",
    });

    // State for our fake AI loading sequence
    let aiSteps = $state({
        details: false,
        photos: false,
        route: false,
        drivers: false,
        bids: 0,
    });

    onMount(() => {
        // 1. Pull data from sessionStorage
        let step1: any = {};
        let step3: any = {};
        try {
            step1 = JSON.parse(
                sessionStorage.getItem("shutup-step1-vehicle") || "{}",
            );
            step3 = JSON.parse(
                sessionStorage.getItem("shutup-step3-route") || "{}",
            );

            if (step1.make && step1.model)
                jobData.make = `${step1.make} ${step1.model}`;
            if (step3.pickup) jobData.pickup = step3.pickup.split(",")[0];
            if (step3.delivery) jobData.delivery = step3.delivery.split(",")[0];
        } catch (e) {
            console.error("Error reading session data:", e);
        }

        // --- THE FAKE AI SEQUENCE ---
        setTimeout(() => (aiSteps.details = true), 1000);
        setTimeout(() => (aiSteps.photos = true), 2200);
        setTimeout(() => (aiSteps.route = true), 3400);

        setTimeout(() => {
            aiSteps.drivers = true;

            // Simulate bids coming in visually
            const bidInterval = setInterval(() => {
                if (aiSteps.bids < 3) {
                    aiSteps.bids += 1;
                } else {
                    clearInterval(bidInterval);
                }
            }, 600);

            // Wait a bit after bids finish, then move to final tracking step
            setTimeout(() => {
                clearInterval(bidInterval);
                aiSteps.bids = 3;
                goto("/submit/tracking");
            }, 2500);
        }, 4600);
    });
</script>

<svelte:head>
    <title>Processing | ShutUP Forwarder</title>
</svelte:head>

<section class="wizard-section">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 wizard-container">
        <div class="summary-card">
            <div class="job-id">
                Job #SF-4821 <span class="badge-success">Submitted ✅</span>
            </div>
            <h2 class="car-name">{jobData.make}</h2>
            <div class="route-display">
                <span class="city">{jobData.pickup}</span>
                <span class="arrow">──────►</span>
                <span class="city">{jobData.delivery}</span>
            </div>
        </div>

        <div class="wizard-card processing-card">
            <div class="ai-header">
                <span class="pulse-robot">⚙️</span>
                <h1 class="wizard-title">System is processing your job...</h1>
            </div>

            <div class="checklist">
                <div class="check-item" class:active={aiSteps.details}>
                    <span class="icon">{aiSteps.details ? "✅" : "⏳"}</span>
                    <span>Car details verified</span>
                </div>
                <div class="check-item" class:active={aiSteps.photos}>
                    <span class="icon">{aiSteps.photos ? "✅" : "⏳"}</span>
                    <span>Photos annotated & locked</span>
                </div>
                <div class="check-item" class:active={aiSteps.route}>
                    <span class="icon">{aiSteps.route ? "✅" : "⏳"}</span>
                    <span>Route & documents checked</span>
                </div>
                <div class="check-item" class:active={aiSteps.drivers}>
                    <span class="icon">{aiSteps.drivers ? "✅" : "⏳"}</span>
                    <span>Finding available drivers...</span>
                </div>
            </div>

            <div class="bidding-box" class:visible={aiSteps.drivers}>
                <div class="bid-count">
                    <strong>{aiSteps.bids}</strong> drivers notified
                </div>
                <div class="bid-status">
                    {#if aiSteps.bids < 3}
                        Awaiting bids...
                    {:else}
                        <span style="color: #16a34a; font-weight: 700;"
                            >Driver secured! Finalizing contract...</span
                        >
                    {/if}
                </div>
            </div>

            <p class="processing-note">
                You'll automatically be redirected once a driver is confirmed.
                Usually under 3 hours.
            </p>
        </div>
    </div>
</section>

<style>
    /* Premium Light Theme Styles */
    .wizard-section {
        min-height: 100vh;
        background: #f8fafc; /* slate-50 */
        color: #0f172a;
        padding: 60px 20px;
        font-family: "Inter", system-ui, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .wizard-container {
        width: 100%;
        max-width: 500px;
    }

    /* Summary Card */
    .summary-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .job-id {
        color: #64748b;
        font-size: 0.9rem;
        font-weight: 700;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }
    .badge-success {
        background: #dcfce7;
        color: #16a34a;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
    }
    .car-name {
        font-size: 1.4rem;
        font-weight: 800;
        margin: 0 0 12px 0;
        color: #0f172a;
    }
    .route-display {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: #475569;
    }
    .arrow {
        color: #2563eb;
        font-size: 0.8rem;
        letter-spacing: -2px;
    }

    /* Main Card */
    .wizard-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 24px;
        padding: 40px;
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .ai-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 30px;
    }
    .pulse-robot {
        font-size: 2.5rem;
        animation: float 3s ease-in-out infinite;
    }
    .wizard-title {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
        letter-spacing: -0.025em;
    }

    /* Checklist */
    .checklist {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 30px;
    }
    .check-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.05rem;
        color: #94a3b8;
        transition: color 0.3s ease;
        font-weight: 500;
    }
    .check-item.active {
        color: #0f172a;
        font-weight: 700;
    }
    .icon {
        font-size: 1.2rem;
    }

    /* Bidding Box */
    .bidding-box {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.5s ease;
        margin-bottom: 24px;
    }
    .bidding-box.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .bid-count {
        font-size: 1.2rem;
        margin-bottom: 4px;
        color: #334155;
        font-weight: 500;
    }
    .bid-count strong {
        font-size: 1.5rem;
        color: #2563eb;
        font-weight: 800;
    }
    .bid-status {
        color: #64748b;
        font-size: 0.95rem;
        font-weight: 500;
    }

    .processing-note {
        color: #64748b;
        font-size: 0.85rem;
        text-align: center;
        line-height: 1.5;
        margin: 0;
    }

    @keyframes float {
        0% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-8px);
        }
        100% {
            transform: translateY(0px);
        }
    }
</style>
