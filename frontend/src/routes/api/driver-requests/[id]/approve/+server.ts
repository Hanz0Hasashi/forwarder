import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';

export async function POST({ params }) {
  const { id } = params;
  
  try {
    const request = await prisma.driverRequest.findUnique({ where: { id } });
    if (!request) {
      return json({ detail: "Application not found" }, { status: 404 });
    }

    if (!env.CLERK_SECRET_KEY) {
      return json({ detail: "CLERK_SECRET_KEY is missing in backend .env" }, { status: 500 });
    }

    // 1. Create the user securely in Clerk
    const clerkResponse = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email_address: [request.email],
        password: request.password,
        first_name: request.firstName,
        last_name: request.lastName,
        skip_password_checks: false,
        public_metadata: {
          role: "employee"
        }
      })
    });

    if (!clerkResponse.ok) {
      const errorText = await clerkResponse.text();
      return json({ detail: `Failed to create Clerk account. Error: ${errorText}` }, { status: 400 });
    }
    
    const clerkUser = await clerkResponse.json();
    const clerkUserId = clerkUser.id;

    // 2. Update local DB
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      await prisma.user.update({
        where: { email: request.email },
        data: { role: "FORWARDER" }
      });
    } else {
      await prisma.user.create({
        data: {
          id: clerkUserId, 
          email: request.email,
          name: `${request.firstName} ${request.lastName}`,
          role: "FORWARDER" 
        }
      });
    }

    // 3. Remove from pending applications
    await prisma.driverRequest.delete({ where: { id } });
    
    return json({ status: "success", message: "Driver approved and account created successfully." });
  } catch (error: any) {
    console.error("Error approving driver:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}
