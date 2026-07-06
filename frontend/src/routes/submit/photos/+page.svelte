<script lang="ts">
    import { goto } from '$app/navigation';
    import Button from '$lib/components/ui/Button.svelte';

    // Track the status using simple strings instead of massive Base64 data
    let photos = $state({
        front: '',
        rear: '',
        left: '',
        right: '',
        interior: '',
        odometer: ''
    });

    let isScanning = $state(false);
    let aiNote = $state('Mock Mode: Image evaluation bypassed.');

    // DUMMY UPLOAD FUNCTION
    function handleDummyUpload(part: keyof typeof photos) {
        photos[part] = 'mock_image_data';

        if (part === 'front') {
            isScanning = true;
            setTimeout(() => {
                isScanning = false;
            }, 800);
        }
    }

    let allDone = $derived(Object.values(photos).every(data => data !== ''));

    function handleNext() {
        if (!allDone) {
            alert("Please mock all required photos before proceeding.");
            return;
        }
        
        sessionStorage.setItem('shutup-step2-photos', JSON.stringify({ 
            completed: true, 
            images: photos 
        }));
        
        goto('/submit/route');
    }
</script>

<svelte:head>
    <title>Step 2: Photos | ShutUP Forwarder</title>
</svelte:head>

<section class="wizard-section">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 wizard-container">
        <div class="wizard-header">
            <a href="/submit" class="back-link">← Back to Vehicle</a>
            <div class="step-indicator">Step 2 of 5</div>
        </div>

        <div class="wizard-card">
            <h1 class="wizard-title">Vehicle Condition</h1>
            <p class="wizard-sub">Upload module disabled per Praveen's instructions. Click below to mock the uploads.</p>

            <div class="photo-grid">
                <div class="photo-slot" class:completed={photos.front !== ''}>
                    <div class="slot-label">FRONT</div>
                    {#if photos.front !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('front')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.rear !== ''}>
                    <div class="slot-label">REAR</div>
                    {#if photos.rear !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('rear')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.left !== ''}>
                    <div class="slot-label">LEFT SIDE</div>
                    {#if photos.left !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('left')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.right !== ''}>
                    <div class="slot-label">RIGHT SIDE</div>
                    {#if photos.right !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('right')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.interior !== ''}>
                    <div class="slot-label">INTERIOR</div>
                    {#if photos.interior !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('interior')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.odometer !== ''}>
                    <div class="slot-label">ODOMETER</div>
                    {#if photos.odometer !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <Button variant="outline" size="sm" extraClass="border-slate-400 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-sky-50" onclick={() => handleDummyUpload('odometer')}>
                            📷 Mock Upload
                        </Button>
                    {/if}
                </div>
            </div>

            <div class="ai-box" class:visible={isScanning || aiNote}>
                {#if isScanning}
                    <div class="scanning-text">🔍 Bypassing automatic image verification...</div>
                {:else if aiNote}
                    <div class="ai-alert">{aiNote}</div>
                {/if}
            </div>

            <Button variant="primary" size="lg" extraClass="w-full" disabled={!allDone} onclick={handleNext}>
                {allDone ? "Confirm Notes & Next →" : "Mock all photos to continue"}
            </Button>
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
        font-family: 'Inter', system-ui, sans-serif; 
    }
    
    .wizard-container { max-width: var(--wizard-max-width); margin: 0 auto; }
    
    .wizard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .back-link { color: var(--text-muted); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
    .back-link:hover { color: var(--accent-primary-strong); }
    
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
        color: #0f172a; 
        letter-spacing: -0.025em; 
    }
    
    .wizard-sub { color: var(--text-muted); margin: 0 0 40px 0; font-size: 1.05rem; line-height: 1.5; }

    .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

    .photo-slot {
        background: var(--surface-soft);
        border: 2px dashed #94a3b8; /* Darkened from cbd5e1 for better visibility */
        border-radius: var(--radius-input);
        padding: 24px 16px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        gap: 12px; 
        transition: all 0.3s ease;
    }
    .photo-slot.completed { 
        border-style: solid; 
        border-color: var(--success-text);
        background: #f0fdf4; 
        padding: 12px; 
    }

    .slot-label { font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; color: var(--text-label); }

    .status-done { color: var(--success-text); font-weight: 700; font-size: 0.9rem; margin-top: 4px; text-align: center; }

    .ai-box { opacity: 0; height: 0; overflow: hidden; transition: all 0.4s ease; margin-bottom: 24px; border-radius: 12px; }
    .ai-box.visible { opacity: 1; height: auto; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; }
    .scanning-text { color: #d97706; font-weight: 600; animation: pulse 1.5s infinite; text-align: center;}
    .ai-alert { color: #b45309; font-weight: 500; line-height: 1.4; }

    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    @media (max-width: 600px) {
        .wizard-card { padding: var(--wizard-card-pad-mobile-y) var(--wizard-card-pad-mobile-x); }
        .wizard-section { padding: var(--wizard-pad-y-mobile) var(--wizard-pad-x-mobile); }
    }
</style>
