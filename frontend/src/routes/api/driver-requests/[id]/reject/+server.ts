import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function POST({ params }) {
  const { id } = params;
  
  try {
    const request = await prisma.driverRequest.findUnique({ where: { id } });
    if (!request) {
      return json({ detail: "Application not found" }, { status: 404 });
    }

    await prisma.driverRequest.delete({ where: { id } });
    return json({ status: "success", message: "Driver request rejected." });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
