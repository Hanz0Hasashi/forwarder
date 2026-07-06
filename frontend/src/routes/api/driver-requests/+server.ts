import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

const DriverApplicationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  companyName: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  licenseClass: z.string().min(1),
  trailerType: z.string().min(1),
  hasWinch: z.boolean().optional().default(false),
  hasCode95: z.boolean().optional().default(false)
});

export async function GET() {
  try {
    const requests = await prisma.driverRequest.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        vatNumber: true,
        licenseClass: true,
        trailerType: true,
        hasWinch: true,
        hasCode95: true,
        status: true,
        createdAt: true
      },
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
    const application = DriverApplicationSchema.parse(await request.json());
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
    if (error instanceof z.ZodError) {
      return json({ detail: 'Invalid application payload', errors: error.flatten() }, { status: 400 });
    }

    console.error("Error saving application:", error);
    return json({ detail: error.message }, { status: 500 });
  }
}
