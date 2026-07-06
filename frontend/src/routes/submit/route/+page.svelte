<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    

    let routeData = $state({
        pickup: "",
        pickupDate: "",
        delivery: "",
        isRunning: "yes",
        extras: {
            roofBox: false,
            bikeRack: false,
            extraWheels: false,
        },
    });

    let isSubmitting = $state(false);

    let estimatedCost = $derived(() => {
        if (!routeData.pickup || !routeData.delivery) return null;
        let sum = 0;
        for (let i = 0; i < routeData.pickup.length; i++) sum += routeData.pickup.charCodeAt(i);
        for (let i = 0; i < routeData.delivery.length; i++) sum += routeData.delivery.charCodeAt(i);
        const basePrice = 150;
        const variablePrice = (sum % 350) + 100;
        return basePrice + variablePrice;
    });
    
    let estimatedDistance = $derived(() => {
        if (!routeData.pickup || !routeData.delivery) return "Unknown";
        let sum = 0;
        for (let i = 0; i < routeData.pickup.length; i++) sum += routeData.pickup.charCodeAt(i);
        for (let i = 0; i < routeData.delivery.length; i++) sum += routeData.delivery.charCodeAt(i);
        return ((sum % 700) + 120).toString() + " km";
    });

    onMount(() => {
        // Pull the initial addresses if they came from the homepage form
        const savedQuote = sessionStorage.getItem("shutup-initial-quote");
        if (savedQuote) {
            try {
                const data = JSON.parse(savedQuote);
                if (data.pickupAddr) routeData.pickup = data.pickupAddr;
                if (data.deliveryAddr) routeData.delivery = data.deliveryAddr;
            } catch (e) {
                console.error("Failed to parse initial quote data", e);
            }
        }
    });

    // ── DEV TOOL: Randomized mock data injection ──
    const routes = [
        { pickup: "Alexanderplatz 1, 10178 Berlin, Germany", delivery: "Marienplatz 1, 80331 Munich, Germany" },
        { pickup: "Herengracht 12, 1015 BZ Amsterdam, Netherlands", delivery: "Maximilianstr. 5, 80539 Munich, Germany" },
        { pickup: "Champ de Mars, 75007 Paris, France", delivery: "Piazza del Duomo, 20121 Milan, Italy" },
        { pickup: "Dam Square, 1012 JS Amsterdam, Netherlands", delivery: "Carrer de Mallorca, 401, 08013 Barcelona, Spain" },
        { pickup: "Rotterdam Port, 3011 TA Rotterdam, Netherlands", delivery: "Stuttgart Central Station, 70173 Stuttgart, Germany" }
    ];
    function fillMockData() {
        const r = routes[Math.floor(Math.random() * routes.length)];
        routeData.pickup = r.pickup;
        routeData.delivery = r.delivery;

        // Random date between 1 and 7 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1);
        routeData.pickupDate = futureDate.toISOString().split("T")[0];

        routeData.isRunning = Math.random() > 0.2 ? "yes" : "no";
        routeData.extras = {
            roofBox: Math.random() > 0.7,
            bikeRack: Math.random() > 0.7,
            extraWheels: Math.random() > 0.7,
        };
    }

    async function handleSubmit(event: Event) {
        event.preventDefault(); // Stops the page from refreshing

        isSubmitting = true;

        // Save current step data to session storage for consistency
        sessionStorage.setItem("shutup-step3-route", JSON.stringify(routeData));

        try {
            // 1. Gather data from previous steps
            const step1Str = sessionStorage.getItem("shutup-step1-vehicle");
            const step1 = step1Str ? JSON.parse(step1Str) : {};

            // Grabbing the updated Photos data which now contains Base64 strings
            const step2Str = sessionStorage.getItem("shutup-step2-photos");
            const step2Data = step2Str ? JSON.parse(step2Str) : {};
            const base64Images = step2Data.images || {};

            // Convert checked 'extras' into a notes string for the AI
            const extrasList = Object.entries(routeData.extras)
                .filter(([_, isChecked]) => isChecked)
                .map(([key, _]) => key)
                .join(", ");
            const finalNotes = extrasList
                ? `Extras included: ${extrasList}`
                : "No extras attached.";

            // 2. Build the exact payload for your FastAPI endpoint
            const payload = {
                vehicle: {
                    make: step1.make || "Unknown",
                    model: step1.model || "Unknown",
                    year: parseInt(step1.year) || 0,
                    runs: routeData.isRunning,
                    notes: finalNotes,
                },
                // NEW: We are now passing the actual Base64 images object!
                photos: base64Images,
                route: {
                    pickup: routeData.pickup,
                    delivery: routeData.delivery,
                    distance: estimatedDistance(),
                },
                targetPrice: estimatedCost(),
                customerId: (typeof window !== 'undefined' && (window as any).Clerk?.user?.id) || null,
                customerEmail: (typeof window !== 'undefined' && (window as any).Clerk?.user?.emailAddresses?.[0]?.emailAddress) || null,
                customerName: (typeof window !== 'undefined' && (window as any).Clerk?.user?.fullName) || null,
            };

            console.log("Sending to AI Dispatch:", payload);

            // 3. Send to FastAPI backend
            const response = await fetch(
                `/api/submit-job`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Success! Job saved:", result);

                // Save the tracking info so the processing page can display it
                // (Using 'shutup-live-job-id' to match our tracking page logic)
                const newJobId =
                    result.job_id ||
                    result.id ||
                    (result.data && result.data.id);
                sessionStorage.setItem("shutup-live-job-id", newJobId);

                // Navigate to the processing/tracking screen
                goto("/submit/processing");
            } else {
                const errorData = await response.json();
                console.error("Backend Error:", errorData);
                alert("Submission failed. Check backend logs.");
            }
        } catch (err) {
            console.error("Network Error:", err);
            alert(
                "Could not connect to AI Dispatcher. Is the FastAPI server running?",
            );
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Step 3: Route | ShutUP Forwarder</title>
</svelte:head>

<section class="wizard-section">
    <div class="container wizard-container">
        <div class="wizard-header">
            <a href="/submit/photos" class="back-link">← Back to Photos</a>

            <div class="header-right">
                <button
                    type="button"
                    class="mock-btn"
                    onclick={fillMockData}
                    title="Fill test route data"
                >
                    🧪 Mock Data
                </button>
                <div class="step-indicator">Step 3 of 5</div>
            </div>
        </div>

        <div class="wizard-card">
            <h1 class="wizard-title">Transport Details</h1>
            <p class="wizard-sub">
                Where is the car going, and what condition is it in?
            </p>

            <form onsubmit={handleSubmit} class="custom-form">
                <div class="form-group">
                    <label for="pickup">Pickup Address</label>
                    <input
                        type="text"
                        id="pickup"
                        bind:value={routeData.pickup}
                        placeholder="e.g. Herengracht 12, 1015 BZ Amsterdam"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="pickupDate">Preferred Pickup Date</label>
                    <input
                        type="date"
                        id="pickupDate"
                        bind:value={routeData.pickupDate}
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="delivery">Delivery Address</label>
                    <input
                        type="text"
                        id="delivery"
                        bind:value={routeData.delivery}
                        placeholder="e.g. Maximilianstr. 5, 80539 Munich"
                        required
                    />
                </div>

                {#if estimatedCost()}
                    <div class="estimate-card animate-fade-in">
                        <div class="estimate-header">
                            <span class="estimate-icon">📊</span>
                            <h3>System Cost Estimate</h3>
                        </div>
                        <div class="estimate-price">€{estimatedCost()}</div>
                        <div class="estimate-subtext">Estimated Distance: {estimatedDistance()}</div>
                        <p class="estimate-note">
                            This is the baseline target budget calculated for this route. Drivers will place their bids relative to this target.
                        </p>
                    </div>
                {/if}

                <hr class="divider" />

                <fieldset class="form-group">
                    <legend>Does the car drive on its own?</legend>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input
                                type="radio"
                                bind:group={routeData.isRunning}
                                value="yes"
                            />
                            <span class="radio-custom"></span>
                            Yes, it runs
                        </label>
                        <label class="radio-label">
                            <input
                                type="radio"
                                bind:group={routeData.isRunning}
                                value="no"
                            />
                            <span class="radio-custom"></span>
                            No, it doesn't start/drive
                        </label>
                    </div>
                </fieldset>

                <hr class="divider" />

                <fieldset class="form-group">
                    <legend>Any extras attached or inside the car?</legend>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                bind:checked={routeData.extras.roofBox}
                            />
                            <span class="checkbox-custom"></span>
                            Roof box
                        </label>
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                bind:checked={routeData.extras.bikeRack}
                            />
                            <span class="checkbox-custom"></span>
                            Bike rack
                        </label>
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                bind:checked={routeData.extras.extraWheels}
                            />
                            <span class="checkbox-custom"></span>
                            Extra set of wheels
                        </label>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    class="submit-btn"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        Processing request...
                    {:else}
                        Submit Job →
                    {/if}
                </button>
            </form>
        </div>
    </div>
</section>

<style>
    /* Premium Light Theme Styles */
    .wizard-section {
        min-height: 100vh;
        background: #f8fafc; /* slate-50 */
        color: #0f172a; /* slate-900 */
        padding: 60px 20px;
        font-family: "Inter", system-ui, sans-serif;
    }

    .wizard-container {
        max-width: 600px;
        margin: 0 auto;
    }

    .wizard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }

    /* ── NEW: Layout for the mock button ── */
    .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .mock-btn {
        background: #f1f5f9;
        border: 1px dashed #cbd5e1;
        color: #64748b;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .mock-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
        border-color: #94a3b8;
    }

    .back-link {
        color: #64748b;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: color 0.2s ease;
    }
    .back-link:hover {
        color: #2563eb;
    }

    .step-indicator {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #475569;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .wizard-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 24px;
        padding: 48px;
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .wizard-title {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0 0 12px 0;
        color: #0f172a;
        letter-spacing: -0.025em;
    }

    .wizard-sub {
        color: #64748b;
        margin: 0 0 40px 0;
        font-size: 1.05rem;
        line-height: 1.5;
    }

    .custom-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 0;
        margin: 0;
        padding: 0;
        min-inline-size: 0;
    }

    legend {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #475569;
        padding: 0;
    }

    label {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #475569;
    }

    input[type="text"],
    input[type="date"] {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px;
        color: #0f172a;
        font-size: 1rem;
        transition: all 0.2s ease;
    }
    input[type="text"]::placeholder {
        color: #94a3b8;
    }
    input[type="text"]:focus,
    input[type="date"]:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        background: #ffffff;
    }

    /* Custom Radio & Checkbox Styling - Light Theme */
    .divider {
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 8px 0;
    }

    .radio-group,
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
    }

    .radio-label,
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        color: #334155;
        text-transform: none;
        letter-spacing: normal;
    }

    .radio-label input,
    .checkbox-label input {
        display: none;
    }

    .radio-custom {
        width: 24px;
        height: 24px;
        border: 2px solid #94a3b8;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        transition: all 0.2s ease;
        background: #ffffff;
    }
    .radio-label input:checked + .radio-custom {
        border-color: #3b82f6;
        background: #ffffff;
    }
    .radio-label input:checked + .radio-custom::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: #3b82f6;
        border-radius: 50%;
    }

    .checkbox-custom {
        width: 24px;
        height: 24px;
        border: 2px solid #94a3b8;
        border-radius: 6px;
        display: inline-block;
        position: relative;
        transition: all 0.2s ease;
        background: #ffffff;
    }
    .checkbox-label input:checked + .checkbox-custom {
        background: #3b82f6;
        border-color: #3b82f6;
    }
    .checkbox-label input:checked + .checkbox-custom::after {
        content: "✓";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 14px;
        font-weight: bold;
    }

    .submit-btn {
        margin-top: 10px;
        width: 100%;
        padding: 18px;
        font-size: 1.1rem;
        border-radius: 12px;
        background: #10b981;
        color: white;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition:
            transform 0.1s ease,
            box-shadow 0.2s ease;
        box-shadow:
            0 4px 6px -1px rgba(16, 185, 129, 0.2),
            0 2px 4px -1px rgba(16, 185, 129, 0.1);
    }
    .submit-btn:hover:not(:disabled) {
        background: #059669;
        transform: translateY(-2px);
        box-shadow:
            0 10px 15px -3px rgba(16, 185, 129, 0.3),
            0 4px 6px -2px rgba(16, 185, 129, 0.15);
    }
    .submit-btn:disabled {
        background: #f1f5f9;
        color: #94a3b8;
        border: 1px solid #cbd5e1;
        cursor: not-allowed;
        box-shadow: none;
    }

    @media (max-width: 600px) {
        .wizard-card {
            padding: 30px 20px;
        }
        .wizard-section {
            padding: 30px 15px;
        }
    }

    /* Intake AI Estimate Card styles */
    .estimate-card {
        background: linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(219, 234, 254, 0.95) 100%);
        border: 1px solid #bfdbfe;
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.05);
        font-family: inherit;
        text-align: left;
    }
    .estimate-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    .estimate-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #1e3a8a;
    }
    .estimate-icon {
        font-size: 1.25rem;
    }
    .estimate-price {
        font-size: 2.25rem;
        font-weight: 850;
        color: #1e40af;
        margin-bottom: 4px;
        letter-spacing: -0.03em;
    }
    .estimate-subtext {
        font-size: 0.85rem;
        color: #4b5563;
        font-weight: 600;
        margin-bottom: 12px;
    }
    .estimate-note {
        font-size: 0.8rem;
        color: #1e3a8a;
        opacity: 0.8;
        line-height: 1.4;
        margin: 0;
    }
</style>
