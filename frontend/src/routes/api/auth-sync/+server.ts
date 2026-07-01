import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function POST({ request }) {
  try {
    const req = await request.json();
    let roleEnum: "CUSTOMER" | "ADMIN" | "FORWARDER" = "CUSTOMER";
    
    if (req.role?.toUpperCase() === "ADMIN") {
      roleEnum = "ADMIN";
    } else if (req.role?.toUpperCase() === "FORWARDER" || req.role?.toLowerCase() === "employee") {
      roleEnum = "FORWARDER";
    }
        
    const existingByEmail = await prisma.user.findUnique({ where: { email: req.email } });
    let emailToUse = req.email;
    
    if (existingByEmail && existingByEmail.id !== req.id) {
      emailToUse = `sync_${req.id.substring(0, 6)}_${req.email}`;
    }

    const user = await prisma.user.upsert({
      where: { id: req.id },
      create: {
        id: req.id,
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
