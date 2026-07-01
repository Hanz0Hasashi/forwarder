import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET() {
  try {
    const requests = await prisma.driverRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
    return json({ status: "success", data: requests });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const application = await request.json();
    console.log(`Received new driver application from ${application.email}`);
    
    const existing = await prisma.driverRequest.findFirst({ where: { email: application.email } });
    if (existing) {
      return json({ detail: "Application already submitted with this email." }, { status: 400 });
    }

    const newRequest = await prisma.driverRequest.create({
      data: {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        password: application.password,
        companyName: application.companyName || null,
        vatNumber: application.vatNumber || null,
        licenseClass: application.licenseClass,
        trailerType: application.trailerType,
        hasWinch: application.hasWinch,
        hasCode95: application.hasCode95,
        status: "PENDING"
      }
    });
    return json({ status: "success", message: "Application submitted successfully", data: newRequest });
  } catch (error: any) {
    console.error("Error saving application:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}
