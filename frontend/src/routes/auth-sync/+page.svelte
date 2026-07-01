<script lang="ts">
    import { onMount } from 'svelte';
    

    onMount(() => {
        const checkUser = setInterval(async () => {
            if (typeof window !== 'undefined' && (window as any).Clerk) {
                clearInterval(checkUser); 
                
                const user = (window as any).Clerk.user;
                
                if (!user) {
                    window.location.href = '/login';
                    return;
                }

                // Grab the role from Clerk
                const role = user.publicMetadata?.role || user.unsafeMetadata?.role || 'client';
                
                try {
                    await fetch(`/api/auth-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.emailAddresses[0]?.emailAddress,
                            name: user.fullName || user.username || "Customer",
                            role: role
                        })
                    });
                } catch (e) {
                    console.error("Backend auth sync failed:", e);
                }
                
                // Write it to Svelte's memory so the root page knows what buttons to show
                localStorage.setItem('userRole', role);
                
                // Send EVERYONE to the root dashboard first
                window.location.href = '/';
            }
        }, 50); 
    });
</script>

<div class="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center font-sans">
    <div class="text-center space-y-6">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Authenticating your session...</h2>
        <p class="text-sm text-slate-500 font-medium">Securing access coordinates and syncing permissions.</p>
    </div>
</div>
