import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params, locals }) {
  const { job_id } = params;
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.job.findUnique({ where: { id: job_id } });
    if (!job) {
      return json({ detail: 'Job not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && job.customerId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: job_id },
      data: { status: "Canceled" }
    });
    return json({ status: "success", data: updatedJob });
  } catch (error: any) {
    console.error("Error in cancel_job:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
