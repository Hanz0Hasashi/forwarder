<script lang="ts">
    
    // ── Reactive Language State ──
    let lang = $state<"en" | "de">("en");

    const translations = {
        en: {
            back: "← Back to Home",
            title: "Driver Application",
            sub: "Submit your details and compliance documents to join our network.",
            basic: "Basic Information",
            fname: "First Name",
            lname: "Last Name",
            email: "Email Address",
            phone: "Phone Number",
            onboarding: "Password Setup",
            onboarding_note: "Password will be set securely through your invitation email after approval.",
            company: "Company Name",
            vat: "VAT Number / USt-IdNr.",
            eq: "Equipment & Capabilities",
            license: "EU License Class",
            trailer: "Trailer Type",
            winch: "I have a motorized winch for accident vehicles",
            comp: "Compliance Verification",
            code95: "Click here to upload Code 95 Certificate (Mock)",
            uploaded: "✅ Uploaded successfully:",
            btn: "Submit Application",
            loading: "Submitting...",
            success:
                "Application received! Our dispatch team will review your details.",
            err_file: "Please upload your Code 95 certificate.",
            err_server:
                "Server connection error. Please ensure the backend is running.",
            mockBtn: "🧪 Fill Mock Data",
        },
        de: {
            back: "← Zurück zur Startseite",
            title: "Fahrerbewerbung",
            sub: "Reichen Sie Ihre Daten und Dokumente ein, um unserem Netzwerk beizutreten.",
            basic: "Grundlegende Informationen",
            fname: "Vorname",
            lname: "Nachname",
            email: "E-Mail Adresse",
            phone: "Telefonnummer",
            onboarding: "Passwort Einrichtung",
            onboarding_note: "Das Passwort wird nach Freigabe sicher per Einladungs-E-Mail gesetzt.",
            company: "Firmenname",
            vat: "USt-IdNr.",
            eq: "Ausrüstung & Fähigkeiten",
            license: "EU-Führerscheinklasse",
            trailer: "Anhängertyp",
            winch: "Ich habe eine motorisierte Seilwinde für Unfallfahrzeuge",
            comp: "Compliance-Prüfung",
            code95: "Hier klicken für Code 95 Upload (Mock)",
            uploaded: "✅ Erfolgreich hochgeladen:",
            btn: "Bewerbung absenden",
            loading: "Wird gesendet...",
            success:
                "Bewerbung erhalten! Unser Dispositionsteam wird Ihre Daten prüfen.",
            err_file: "Bitte laden Sie Ihr Code 95 Zertifikat hoch.",
            err_server:
                "Serververbindungsfehler. Bitte prüfen Sie das Backend.",
            mockBtn: "🧪 Testdaten einfügen",
        },
    };

    let t = $derived(translations[lang]);

    // ── Form State ──
    let firstName = $state("");
    let lastName = $state("");
    let email = $state("");
    let phone = $state("");
    let companyName = $state("");
    let vatNumber = $state("");

    let licenseClass = $state("CE");
    let trailerType = $state("Flatbed (1-2 cars)");
    let hasWinch = $state(false);

    let code95FileName = $state("");
    let isSubmitting = $state(false);
    let successMessage = $state("");
    let errorMessage = $state("");

    // ── Mock Data Generator ──
    const mockProfiles = [
        {
            firstName: "Klaus",
            lastName: "Weber",
            email: "driver1@gmail.com",
            phone: "+49 151 12345678",
            companyName: "Weber Transporte",
            vatNumber: "DE123456789",
            licenseClass: "CE",
            trailerType: "Flatbed (1-2 cars)",
            hasWinch: true,
        },
        {
            firstName: "Sarah",
            lastName: "Schmidt",
            email: "driver2@gmail.com",
            phone: "+49 172 98765432",
            companyName: "VIP Auto Kurier",
            vatNumber: "",
            licenseClass: "BE",
            trailerType: "Enclosed (Luxury)",
            hasWinch: false,
        },
        {
            firstName: "Lukas",
            lastName: "Meyer",
            email: "driver3@gmail.com",
            phone: "+49 160 55544433",
            companyName: "Meyer Multi-Haul GmbH",
            vatNumber: "DE987654321",
            licenseClass: "C1E",
            trailerType: "Multi-car (3-5 cars)",
            hasWinch: true,
        },
    ];
    let profileIndex = 0;

    function fillMockData() {
        const p = mockProfiles[profileIndex];
        firstName = p.firstName;
        lastName = p.lastName;
        email = p.email;
        phone = p.phone;
        companyName = p.companyName;
        vatNumber = p.vatNumber;
        licenseClass = p.licenseClass;
        trailerType = p.trailerType;
        hasWinch = p.hasWinch;

        // Auto-fill the fake document too
        code95FileName = `Code95_${p.firstName}_${p.lastName}_Verified.pdf`;

        profileIndex = (profileIndex + 1) % mockProfiles.length;
    }

    // ── Fake Upload Handler ──
    function triggerFakeUpload() {
        code95FileName = "Code95_Certificate_Verified.pdf";
    }

    async function submitApplication(e: Event) {
        e.preventDefault();

        if (!code95FileName) {
            errorMessage = t.err_file;
            return;
        }

        isSubmitting = true;
        errorMessage = "";
        successMessage = "";

        try {
            const res = await fetch(`/api/driver-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    companyName,
                    vatNumber,
                    licenseClass,
                    trailerType,
                    hasWinch,
                    hasCode95: true,
                }),
            });

            if (res.ok) {
                successMessage = t.success;
                firstName = "";
                lastName = "";
                email = "";
                phone = "";
                companyName = "";
                vatNumber = "";
                hasWinch = false;
                code95FileName = "";
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                const data = await res.json();
                errorMessage = data.detail || t.err_server;
            }
        } catch (err) {
            errorMessage = t.err_server;
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Apply as Driver | ShutUP Forwarder</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 py-10 px-6 font-sans" aria-labelledby="driver-apply-title">
    <div class="max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <a
                href="/"
                class="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-sm font-semibold py-2 px-5 rounded-full shadow-sm transition-colors no-underline"
            >
                {t.back}
            </a>

            <div class="flex items-center gap-3">
                <button
                    type="button"
                    onclick={fillMockData}
                    class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-colors"
                >
                    {t.mockBtn}
                </button>

                <div
                    class="flex bg-white shadow-sm border border-slate-200 rounded-lg p-1"
                >
                    <button
                        type="button"
                        class="px-3 py-1 text-sm font-bold rounded-md transition-colors {lang ===
                        'en'
                            ? 'bg-slate-100 text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'}"
                        onclick={() => (lang = "en")}>EN</button
                    >
                    <button
                        type="button"
                        class="px-3 py-1 text-sm font-bold rounded-md transition-colors {lang ===
                        'de'
                            ? 'bg-slate-100 text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'}"
                        onclick={() => (lang = "de")}>DE</button
                    >
                </div>
            </div>
        </div>

        <div class="text-center mb-10">
            <h1 id="driver-apply-title" class="text-4xl font-extrabold text-slate-900 tracking-tight">
                {t.title}
            </h1>
            <p class="text-slate-500 mt-3 text-lg">{t.sub}</p>
        </div>

        {#if successMessage}
            <div
                class="bg-green-50 text-green-700 p-5 rounded-xl border border-green-200 mb-8 text-center font-bold text-lg shadow-sm"
            >
                {successMessage}
            </div>
        {/if}

        {#if errorMessage}
            <div
                class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-8 text-center font-semibold shadow-sm"
            >
                ⚠️ {errorMessage}
            </div>
        {/if}

        <form onsubmit={submitApplication} class="space-y-6">
            <div
                class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
            >
                <h3
                    class="text-xl font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100"
                >
                    {t.basic}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label
                            for="firstName"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.fname}</label
                        >
                        <input
                            id="firstName"
                            type="text"
                            bind:value={firstName}
                            autocomplete="given-name"
                            required
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="lastName"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.lname}</label
                        >
                        <input
                            id="lastName"
                            type="text"
                            bind:value={lastName}
                            autocomplete="family-name"
                            required
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.email}</label
                        >
                        <input
                            id="email"
                            type="email"
                            bind:value={email}
                            autocomplete="email"
                            required
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="phone"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.phone}</label
                        >
                        <input
                            id="phone"
                            type="tel"
                            bind:value={phone}
                            autocomplete="tel"
                            required
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    <div class="md:col-span-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4">
                        <p class="m-0 font-semibold">{t.onboarding}</p>
                        <p class="m-0 mt-1 text-sm">{t.onboarding_note}</p>
                    </div>

                    <div>
                        <label
                            for="companyName"
                            class="block text-sm font-semibold text-slate-700 mb-2 mt-4"
                            >{t.company}
                            <span class="text-slate-400 font-normal"
                                >(Optional)</span
                            ></label
                        >
                        <input
                            id="companyName"
                            type="text"
                            bind:value={companyName}
                            autocomplete="organization"
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="vatNumber"
                            class="block text-sm font-semibold text-slate-700 mb-2 mt-4"
                            >{t.vat}
                            <span class="text-slate-400 font-normal"
                                >(Optional)</span
                            ></label
                        >
                        <input
                            id="vatNumber"
                            type="text"
                            bind:value={vatNumber}
                            autocomplete="off"
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div
                class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
            >
                <h3
                    class="text-xl font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100"
                >
                    {t.eq}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                        <label
                            for="licenseClass"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.license}</label
                        >
                        <select
                            id="licenseClass"
                            bind:value={licenseClass}
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="CE">Class CE (Heavy Truck)</option>
                            <option value="C1E">Class C1E (Medium Truck)</option
                            >
                            <option value="BE">Class BE (Van + Trailer)</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="trailerType"
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >{t.trailer}</label
                        >
                        <select
                            id="trailerType"
                            bind:value={trailerType}
                            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="Flatbed (1-2 cars)"
                                >Flatbed (1-2 cars)</option
                            >
                            <option value="Multi-car (3-5 cars)"
                                >Multi-car (3-5 cars)</option
                            >
                            <option value="Enclosed (Luxury)"
                                >Enclosed (Luxury)</option
                            >
                        </select>
                    </div>
                </div>

                <label
                    for="hasWinch"
                    class="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                >
                    <input
                        id="hasWinch"
                        type="checkbox"
                        bind:checked={hasWinch}
                        class="w-6 h-6 text-blue-600 rounded bg-white border-slate-300 focus:ring-blue-500"
                    />
                    <span class="text-base font-semibold text-slate-800"
                        >{t.winch}</span
                    >
                </label>
            </div>

            <div
                class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
            >
                <h3
                    class="text-xl font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100"
                >
                    {t.comp}
                </h3>

                {#if !code95FileName}
                    <button
                        type="button"
                        onclick={triggerFakeUpload}
                        class="w-full block border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-10 text-center cursor-pointer hover:bg-blue-100 hover:border-blue-500 transition-all group"
                    >
                        <div
                            class="text-5xl mb-3 group-hover:scale-110 transition-transform"
                        >
                            📄
                        </div>
                        <span class="text-base font-bold text-blue-700"
                            >{t.code95}</span
                        >
                    </button>
                {:else}
                    <div
                        class="w-full border-2 border-solid border-green-400 bg-green-50 rounded-xl p-8 text-center"
                    >
                        <div class="text-4xl mb-2">✅</div>
                        <p class="text-green-800 font-semibold">
                            {t.uploaded} <br /><span
                                class="text-green-600 bg-white px-3 py-1 rounded-md mt-2 inline-block border border-green-200"
                                >{code95FileName}</span
                            >
                        </p>
                    </div>
                {/if}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                class="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg py-5 rounded-xl shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-70 mt-4"
            >
                {isSubmitting ? t.loading : t.btn}
            </button>
        </form>
    </div>
</main>
