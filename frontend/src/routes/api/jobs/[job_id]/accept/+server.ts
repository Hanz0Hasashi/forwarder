import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params }) {
  const { job_id } = params;
  try {
    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: { status: "Pending Pickup" }
    });
    return json({ success: true, job: updatedJob });
  } catch (error: any) {
    return json({ detail: "Job not found" }, { status: 404 });
  }
}
