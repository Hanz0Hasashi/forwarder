import { json, type RequestEvent } from '@sveltejs/kit';
import { CLERK_SECRET_KEY } from '$env/static/private';

const CLERK_API = 'https://api.clerk.com/v1';

// 1. GET: Fetch all real users from your Clerk Database
export async function GET() {
    try {
        const response = await fetch(`${CLERK_API}/users?limit=100`, {
            headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
        });
        
        const clerkUsers = await response.json();
        
        // Clean up the data so our frontend table can easily read it
        const users = clerkUsers.map((u: any) => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User',
            email: u.email_addresses[0]?.email_address || 'No Email',
            role: u.public_metadata?.role || 'client'
        }));
        
        return json(users);
    } catch (e) {
        return json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// 2. PATCH: Update a user's role
export async function PATCH({ request }: RequestEvent) {
    const { userId, role } = await request.json();
    
    const response = await fetch(`${CLERK_API}/users/${userId}/metadata`, {
        method: 'PATCH',
        headers: { 
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ public_metadata: { role } })
    });
    
    if (!response.ok) return json({ error: 'Failed to update role' }, { status: 500 });
    return json({ success: true });
}

// 3. DELETE: Permanently remove a user
export async function DELETE({ request }: RequestEvent) {
    const { userId } = await request.json();
    
    const response = await fetch(`${CLERK_API}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    
    if (!response.ok) return json({ error: 'Failed to delete user' }, { status: 500 });
    return json({ success: true });
}