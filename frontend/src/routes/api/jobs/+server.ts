import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET() {
  try {
    const rawJobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return json({ status: "success", count: rawJobs.length, data: rawJobs });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
