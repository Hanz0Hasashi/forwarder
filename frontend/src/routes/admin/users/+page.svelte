<script lang="ts">
    import { onMount } from 'svelte';

    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    let users = $state<User[]>([]);
    let isLoading = $state(true);
    let isUpdating = $state(false);

    // Fetch real data on page load
    onMount(async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) users = await res.json();
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            isLoading = false;
        }
    });

    // Call our backend PATCH route
    async function updateRole(userId: string, newRole: string) {
        isUpdating = true;
        
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (res.ok) {
                const userIndex = users.findIndex(u => u.id === userId);
                if (userIndex !== -1) users[userIndex].role = newRole;
            } else {
                alert("Failed to update role in database.");
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            isUpdating = false;
        }
    }

    // Call our backend DELETE route
    async function deleteUser(userId: string, userName: string) {
        const confirmed = confirm(`CRITICAL WARNING: Are you sure you want to permanently delete ${userName}?`);
        if (!confirmed) return;

        isUpdating = true;
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                users = users.filter(u => u.id !== userId);
            } else {
                alert("Failed to delete user.");
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            isUpdating = false;
        }
    }
</script>

<div class="space-y-8 animate-fade-in p-6 bg-slate-50 min-h-[85vh] font-sans">
    
    <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">User Access Management</h1>
            <p class="text-sm text-slate-500 mt-1">
                Assign administrative roles and handle live system access credentials.
            </p>
        </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {#if isLoading}
            <div class="py-20 text-center space-y-4">
                <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p class="text-slate-500 text-sm font-semibold tracking-wide">Retrieving team manifests from remote server...</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-left m-0">
                    <thead>
                        <tr class="bg-slate-900 border-b border-slate-800 text-white">
                            <th class="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-xs border-0">User / Email</th>
                            <th class="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-xs border-0">Current Role</th>
                            <th class="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-xs border-0">Change Role</th>
                            <th class="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-xs border-0 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {#each users as user (user.id)}
                            <tr class="hover:bg-slate-50/60 transition-colors">
                                <td class="p-4 px-6 align-middle">
                                    <div class="flex flex-col gap-0.5">
                                        <span class="font-extrabold text-slate-900 text-base">{user.name || 'Unregistered User'}</span>
                                        <span class="text-xs text-slate-400 font-medium font-mono">{user.email}</span>
                                    </div>
                                </td>
                                
                                <td class="p-4 px-6 align-middle">
                                    <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block
                                               {user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                               {user.role === 'employee' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                               {user.role === 'client' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}">
                                        {user.role}
                                    </span>
                                </td>

                                <td class="p-4 px-6 align-middle">
                                    <select 
                                        class="bg-white border border-slate-200 text-slate-800 text-xs font-bold p-2 px-3 rounded-lg shadow-sm outline-none cursor-pointer hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                        value={user.role} 
                                        onchange={(e) => updateRole(user.id, (e.target as HTMLSelectElement).value)}
                                        disabled={isUpdating}
                                    >
                                        <option value="client">Client (Default)</option>
                                        <option value="employee">Employee (Driver)</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>

                                <td class="p-4 px-6 align-middle text-right">
                                    <button 
                                        class="inline-flex items-center gap-1.5 bg-transparent border border-rose-200 hover:border-rose-400 text-rose-500 hover:bg-rose-50/50 font-bold text-xs py-2 px-3.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        onclick={() => deleteUser(user.id, user.name)}
                                        disabled={isUpdating || user.role === 'admin'} 
                                        title={user.role === 'admin' ? "System admin permissions cannot be soft-purged" : "Wipe profile node access"}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                                        </svg>
                                        Remove 
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if users.length === 0}
                <div class="p-16 text-center text-sm text-slate-400 font-medium">
                    No active personnel profiles found registered inside the access grid.
                </div>
            {/if}
        {/if}
    </div>
</div>
