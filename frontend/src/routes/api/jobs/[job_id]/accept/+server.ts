import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params, locals }) {
  const { job_id } = params;
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingJob = await prisma.job.findUnique({ where: { id: job_id } });
    if (!existingJob) {
      return json({ detail: 'Job not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && existingJob.customerId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: { status: "Pending Pickup" }
    });
    return json({ success: true, job: updatedJob });
  } catch (error: any) {
    return json({ detail: "Job not found" }, { status: 404 });
  }
}
