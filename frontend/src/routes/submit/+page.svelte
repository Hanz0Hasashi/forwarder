<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

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
    <div class="container wizard-container">
        <div class="wizard-header">
            <a href="/" class="back-link">← Back to home</a>

            <div class="header-right">
                <button
                    type="button"
                    class="mock-btn"
                    onclick={fillMockData}
                    title="Fill test vehicle data"
                >
                    🧪 Mock Data
                </button>
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
                        <button
                            type="button"
                            class="scan-btn"
                            title="Scan with camera">📷</button
                        >
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

                <button type="submit" class="submit-btn"
                    >Next: Upload Photos →</button
                >
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
        color: #475569;
    }

    input,
    select {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px;
        color: #0f172a;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    input::placeholder {
        color: #94a3b8;
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        background: #ffffff;
    }

    select option {
        background: #ffffff;
        color: #0f172a;
    }

    .input-wrapper {
        position: relative;
        display: flex;
    }

    .input-wrapper input {
        width: 100%;
        padding-right: 60px;
    }

    .scan-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1.1rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .scan-btn:hover {
        background: #f0f9ff;
        border-color: #bae6fd;
    }

    .submit-btn {
        margin-top: 20px;
        width: 100%;
        padding: 18px;
        font-size: 1.1rem;
        border-radius: 12px;
        background: #2563eb;
        color: white;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition:
            transform 0.1s ease,
            box-shadow 0.2s ease;
    }

    .submit-btn:hover {
        transform: translateY(-2px);
        background: #1d4ed8;
        box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5);
    }

    @media (max-width: 600px) {
        .form-row {
            flex-direction: column;
            gap: 24px;
        }
        .wizard-card {
            padding: 30px 20px;
        }
        .wizard-section {
            padding: 30px 15px;
        }
    }
</style>
