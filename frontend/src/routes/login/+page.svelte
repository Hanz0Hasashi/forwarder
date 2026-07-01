<script lang="ts">
    import { SignIn } from 'svelte-clerk';
</script>

<div class="login-wrapper">
    <a href="/" class="back-link">
        &larr; Back to Dashboard
    </a>

    <div class="login-container">
        <div class="brand-header">
            <span class="logo-icon">🚗</span>
            <h1>ShutUP <strong>Forwarder</strong></h1>
        </div>
        
        <SignIn forceRedirectUrl="/auth-sync" signUpUrl="/signup" />
    </div>
</div>

<style>
    .login-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f8fafc; 
        
        /* The "box style" grid pattern */
        background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
        background-size: 64px 64px;
        
        font-family: system-ui, -apple-system, sans-serif;
        padding: 2rem;
    }

    .back-link {
        position: absolute;
        top: 2rem;
        left: 2rem;
        color: #64748b; 
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        transition: color 0.2s ease;
        background: white;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
    }

    .back-link:hover {
        color: #0f172a; 
        background-color: #f1f5f9;
    }

    .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        z-index: 10;
    }

    .brand-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .logo-icon {
        font-size: 2.5rem;
    }

    h1 {
        margin: 0;
        color: #0f172a;
        font-size: 1.5rem;
        font-weight: 500;
        letter-spacing: -0.025em;
    }

    h1 strong {
        font-weight: 800;
        color: #2563eb; 
    }
</style>