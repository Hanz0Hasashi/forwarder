<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";

    let vehicle = {
        vin: "",
        make: "",
        model: "",
        year: "",
        fuelType: "",
        mileage: "",
    };

    onMount(() => {
        // Pull the initial data if they came from the homepage form
        const savedQuote = sessionStorage.getItem("shutup-initial-quote");
        if (savedQuote) {
            try {
                const data = JSON.parse(savedQuote);
                // Just dropping the raw string into the 'make' field for now
                // Later you can write logic to split "BMW 3 Series 2019" into separate fields
                if (data.carModel) vehicle.make = data.carModel;
            } catch (e) {
                console.error("Failed to parse initial quote data", e);
            }
        }
    });

    // ── DEV TOOL: Randomized mock data injection ──
    const vehicles = [
        {
            vin: "WBA3A5C50CF256551",
            make: "BMW",
            model: "3 Series",
            year: "2019",
            fuelType: "Diesel",
            mileage: "87000",
        },
        {
            vin: "WVWZZZCDZNW123456",
            make: "Volkswagen",
            model: "Golf 8",
            year: "2022",
            fuelType: "Petrol",
            mileage: "45000",
        },
        {
            vin: "SALWR2VF8HA123456",
            make: "Land Rover",
            model: "Defender",
            year: "2021",
            fuelType: "Diesel",
            mileage: "32000",
        },
        {
            vin: "WUAZZZF84HA654321",
            make: "Audi",
            model: "R8 V10",
            year: "2020",
            fuelType: "Petrol",
            mileage: "15000",
        },
        {
            vin: "WP0ZZZ99ZLS123456",
            make: "Porsche",
            model: "911 Carrera",
            year: "2023",
            fuelType: "Petrol",
            mileage: "8000",
        },
    ];
    function fillMockData() {
        const v = vehicles[Math.floor(Math.random() * vehicles.length)];
        vehicle.vin = v.vin;
        vehicle.make = v.make;
        vehicle.model = v.model;
        vehicle.year = v.year;
        vehicle.fuelType = v.fuelType;
        vehicle.mileage = v.mileage;
    }

    function handleNext(event: Event) {
        event.preventDefault();

        console.log("Proceeding to Step 2 with:", vehicle);
        sessionStorage.setItem("shutup-step1-vehicle", JSON.stringify(vehicle));
        goto("/submit/photos");
    }
</script>

<svelte:head>
    <title>Step 1: Vehicle Identity | ShutUP Forwarder</title>
</svelte:head>

<section class="wizard-section">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 wizard-container">
        <div class="wizard-header">
            <a href="/" class="back-link">← Back to home</a>

            <div class="header-right">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    extraClass="border-dashed px-3 py-1.5 text-[11px]"
                    onclick={fillMockData}
                    title="Fill test vehicle data"
                >
                    🧪 Mock Data
                </Button>
                <div class="step-indicator">Step 1 of 5</div>
            </div>
        </div>

        <div class="wizard-card">
            <h1 class="wizard-title">Vehicle Identity</h1>
            <p class="wizard-sub">
                Tell us the exact details of the vehicle you need to move.
            </p>

            <form onsubmit={handleNext} class="custom-form">
                <div class="form-group">
                    <label for="vin">Chassis / VIN Number</label>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            id="vin"
                            bind:value={vehicle.vin}
                            placeholder="e.g. WBA3A5C50CF256551"
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            extraClass="px-3"
                            title="Scan with camera"
                        >
                            📷
                        </Button>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="make">Make</label>
                        <input
                            type="text"
                            id="make"
                            bind:value={vehicle.make}
                            placeholder="e.g. BMW"
                            required
                        />
                    </div>
                    <div class="form-group half">
                        <label for="model">Model</label>
                        <input
                            type="text"
                            id="model"
                            bind:value={vehicle.model}
                            placeholder="e.g. 3 Series"
                            required
                        />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="year">Year</label>
                        <input
                            type="number"
                            id="year"
                            bind:value={vehicle.year}
                            placeholder="e.g. 2019"
                            required
                        />
                    </div>
                    <div class="form-group half">
                        <label for="fuel">Fuel Type</label>
                        <select
                            id="fuel"
                            bind:value={vehicle.fuelType}
                            required
                        >
                            <option value="" disabled selected>Select...</option
                            >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="mileage">Mileage (km)</label>
                    <input
                        type="number"
                        id="mileage"
                        bind:value={vehicle.mileage}
                        placeholder="e.g. 87000"
                        required
                    />
                </div>

                <Button type="submit" variant="primary" size="lg" extraClass="w-full">
                    Next: Upload Photos →
                </Button>
            </form>
        </div>
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

    .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .back-link {
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: color 0.2s ease;
    }

    .back-link:hover {
        color: var(--accent-primary-strong);
    }

    .step-indicator {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: var(--text-label);
        box-shadow: var(--shadow-chip);
    }

    .wizard-card {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-card);
        padding: var(--wizard-card-pad);
        box-shadow: var(--shadow-card);
    }

    .wizard-title {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0 0 12px 0;
        color: var(--text-strong);
        letter-spacing: -0.025em;
    }

    .wizard-sub {
        color: var(--text-muted);
        margin: 0 0 40px 0;
        font-size: 1.05rem;
        line-height: 1.5;
    }

    .custom-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .form-row {
        display: flex;
        gap: 20px;
    }

    .half {
        flex: 1;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    label {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-label);
    }

    input,
    select {
        background: var(--surface-soft);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-input);
        padding: 16px;
        color: var(--text-strong);
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    input::placeholder {
        color: var(--border-subtle);
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        background: var(--surface);
    }

    select option {
        background: var(--surface);
        color: var(--text-strong);
    }

    .input-wrapper {
        position: relative;
        display: flex;
    }

    .input-wrapper input {
        width: 100%;
        padding-right: 60px;
    }

    @media (max-width: 600px) {
        .wizard-card {
            padding: var(--wizard-card-pad-mobile-y) var(--wizard-card-pad-mobile-x);
        }
        .wizard-section {
            padding: var(--wizard-pad-y-mobile) var(--wizard-pad-x-mobile);
        }
    }
</style>
