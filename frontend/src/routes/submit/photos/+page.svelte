<script lang="ts">
    import { goto } from '$app/navigation';

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
    <div class="container wizard-container">
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
                        <button class="upload-btn" onclick={() => handleDummyUpload('front')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.rear !== ''}>
                    <div class="slot-label">REAR</div>
                    {#if photos.rear !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <button class="upload-btn" onclick={() => handleDummyUpload('rear')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.left !== ''}>
                    <div class="slot-label">LEFT SIDE</div>
                    {#if photos.left !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <button class="upload-btn" onclick={() => handleDummyUpload('left')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.right !== ''}>
                    <div class="slot-label">RIGHT SIDE</div>
                    {#if photos.right !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <button class="upload-btn" onclick={() => handleDummyUpload('right')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.interior !== ''}>
                    <div class="slot-label">INTERIOR</div>
                    {#if photos.interior !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <button class="upload-btn" onclick={() => handleDummyUpload('interior')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>

                <div class="photo-slot" class:completed={photos.odometer !== ''}>
                    <div class="slot-label">ODOMETER</div>
                    {#if photos.odometer !== ''}
                        <div class="status-done">✅ Image Mocked</div>
                    {:else}
                        <button class="upload-btn" onclick={() => handleDummyUpload('odometer')}>
                            📷 Mock Upload
                        </button>
                    {/if}
                </div>
            </div>

            <div class="ai-box" class:visible={isScanning || aiNote}>
                {#if isScanning}
                    <div class="scanning-text">🤖 Bypassing AI vision processing...</div>
                {:else if aiNote}
                    <div class="ai-alert">{aiNote}</div>
                {/if}
            </div>

            <button class="submit-btn" disabled={!allDone} onclick={handleNext}>
                {allDone ? "Confirm Notes & Next →" : "Mock all photos to continue"}
            </button>
        </div>
    </div>
</section>

<style>
    /* Premium Light Theme Styles */
    .wizard-section { 
        min-height: 100vh; 
        background: #f8fafc; /* slate-50 */
        color: #0f172a;      /* slate-900 */
        padding: 60px 20px; 
        font-family: 'Inter', system-ui, sans-serif; 
    }
    
    .wizard-container { max-width: 600px; margin: 0 auto; }
    
    .wizard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .back-link { color: #64748b; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
    .back-link:hover { color: #2563eb; }
    
    .step-indicator { 
        background: #ffffff; 
        border: 1px solid #cbd5e1; /* Darkened */
        padding: 6px 14px; 
        border-radius: 20px; 
        font-size: 0.85rem; 
        font-weight: 700; 
        color: #475569; 
        box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
    }
    
    .wizard-card { 
        background: #ffffff; 
        border: 1px solid #cbd5e1; /* Darkened from e2e8f0 */
        border-radius: 24px; 
        padding: 48px; 
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); 
    }
    
    .wizard-title { 
        font-size: 2.2rem; 
        font-weight: 800; 
        margin: 0 0 12px 0; 
        color: #0f172a; 
        letter-spacing: -0.025em; 
    }
    
    .wizard-sub { color: #64748b; margin: 0 0 40px 0; font-size: 1.05rem; line-height: 1.5; }

    .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

    .photo-slot {
        background: #f8fafc; 
        border: 2px dashed #94a3b8; /* Darkened from cbd5e1 for better visibility */
        border-radius: 12px;
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
        border-color: #22c55e; 
        background: #f0fdf4; 
        padding: 12px; 
    }

    .slot-label { font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; color: #475569; } /* Darkened text slightly */

    .upload-btn {
        display: inline-block; 
        background: #ffffff; 
        border: 1px solid #94a3b8; /* Darkened */
        color: #334155;
        padding: 8px 16px; 
        border-radius: 8px; 
        font-size: 0.9rem; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s ease; 
        text-align: center; 
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .upload-btn:hover { 
        background: #f0f9ff; 
        border-color: #0284c7; 
        color: #0284c7; 
    }
    
    .status-done { color: #16a34a; font-weight: 700; font-size: 0.9rem; margin-top: 4px; text-align: center; }

    .ai-box { opacity: 0; height: 0; overflow: hidden; transition: all 0.4s ease; margin-bottom: 24px; border-radius: 12px; }
    .ai-box.visible { opacity: 1; height: auto; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; }
    .scanning-text { color: #d97706; font-weight: 600; animation: pulse 1.5s infinite; text-align: center;}
    .ai-alert { color: #b45309; font-weight: 500; line-height: 1.4; }

    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .submit-btn {
        width: 100%; 
        padding: 18px; 
        font-size: 1.1rem; 
        border-radius: 12px; 
        background: #2563eb;
        color: white; 
        border: none; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s ease;
    }
    .submit-btn:disabled { 
        background: #f1f5f9; 
        color: #94a3b8; 
        border: 1px solid #cbd5e1; 
        cursor: not-allowed; 
        box-shadow: none; 
    }
    .submit-btn:not(:disabled):hover { 
        background: #1d4ed8; 
        transform: translateY(-2px); 
        box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5); 
    }

    @media (max-width: 600px) {
        .wizard-card { padding: 30px 20px; }
        .wizard-section { padding: 30px 15px; }
    }
</style>
