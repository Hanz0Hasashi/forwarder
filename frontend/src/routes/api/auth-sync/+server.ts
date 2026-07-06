import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { normalizeRole } from '$lib/server/apiAuth';

export async function POST({ request, locals }) {
  try {
    const req = await request.json();
    const authUserId = locals.auth.userId;
    if (!authUserId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleEnum = normalizeRole(req.role);
        
    const existingByEmail = await prisma.user.findUnique({ where: { email: req.email } });
    let emailToUse = req.email;
    
    if (existingByEmail && existingByEmail.id !== authUserId) {
      emailToUse = `sync_${authUserId.substring(0, 6)}_${req.email}`;
    }

    const user = await prisma.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email: emailToUse,
        name: req.name || null,
        role: roleEnum
      },
      update: {
        email: emailToUse,
        name: req.name || null,
        role: roleEnum
      }
    });
    
    return json({ status: "success", data: user });
  } catch (error: any) {
    console.error("Error in auth_sync:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
