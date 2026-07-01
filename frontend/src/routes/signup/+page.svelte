<script lang="ts">
    import { SignUp } from 'svelte-clerk';
</script>

<svelte:head>
    <title>Sign Up | ShutUP Forwarder</title>
</svelte:head>

<section class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Custom Grid Background -->
    <div class="absolute inset-0 z-0 opacity-40 pointer-events-none" style="background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px); background-size: 40px 40px;"></div>

    <div class="z-10 w-full max-w-md flex flex-col items-center">
        <!-- Back Button -->
        <div class="absolute top-8 left-8">
            <a href="/" class="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 text-sm font-semibold py-2 px-5 rounded-full shadow-sm transition-colors flex items-center gap-2 no-underline">
                ← Back to Home
            </a>
        </div>

        <!-- Branding -->
        <div class="text-center mb-6">
            <div class="text-4xl mb-2">🚙</div>
            <h1 class="text-2xl font-bold text-slate-900">ShutUP <span class="text-blue-600">Forwarder</span></h1>
        </div>

        <!-- Clerk Component Box -->
        <div class="w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-100 bg-white flex justify-center p-2">
            <!-- We point signInUrl back to your custom login page -->
            <SignUp signInUrl="/login" fallbackRedirectUrl="/dashboard" />
        </div>
    </div>
</section>