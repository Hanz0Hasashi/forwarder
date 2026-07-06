import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';

export async function POST({ params, url }) {
  const { id } = params;
  
  try {
    const request = await prisma.driverRequest.findUnique({ where: { id } });
    if (!request) {
      return json({ detail: "Application not found" }, { status: 404 });
    }

    if (!env.CLERK_SECRET_KEY) {
      return json({ detail: "CLERK_SECRET_KEY is missing in backend .env" }, { status: 500 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    // 1. Send a secure onboarding invitation instead of handling passwords server-side.
    const clerkResponse = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        email_address: request.email,
        redirect_url: `${url.origin}/signup`,
        public_metadata: {
          role: "employee"
        }
      })
    });
    clearTimeout(timeout);

    if (!clerkResponse.ok) {
      const errorText = await clerkResponse.text();
      return json({ detail: `Failed to create Clerk account. Error: ${errorText}` }, { status: 400 });
    }
    
    // 2. Update local DB if a user already exists.
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      await prisma.user.update({
        where: { email: request.email },
        data: { role: "FORWARDER" }
      });
    }

    // 3. Remove from pending applications
    await prisma.driverRequest.delete({ where: { id } });
    
    return json({ status: "success", message: "Driver approved and onboarding invite sent." });
  } catch (error: any) {
    console.error("Error approving driver:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}
