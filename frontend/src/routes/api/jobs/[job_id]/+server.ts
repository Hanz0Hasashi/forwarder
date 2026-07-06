import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
  const { job_id } = params;
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: { bids: true, forwarder: true, customer: true }
    });
    
    if (!job) {
      return json({ detail: "Job not found" }, { status: 404 });
    }

    if (role !== 'ADMIN') {
      if (role === 'CUSTOMER' && job.customerId !== userId) {
        return json({ error: 'Forbidden' }, { status: 403 });
      }

      if (role === 'FORWARDER') {
        const relatedToForwarder =
          job.status === 'Reviewing' ||
          job.forwarderId === userId ||
          job.bids.some((bid: any) => bid.forwarderId === userId);

        if (!relatedToForwarder) {
          return json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }
    
    return json({ status: "success", data: job });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params, locals }) {
  const { job_id } = params;
  try {
    if (locals.auth.role !== 'ADMIN') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.job.delete({ where: { id: job_id } });
    return json({ status: "success", message: "Job deleted" });
  } catch (error) {
    return json({ detail: "Job not found" }, { status: 404 });
  }
}
