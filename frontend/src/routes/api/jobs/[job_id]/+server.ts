import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params }) {
  const { job_id } = params;
  try {
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: { bids: true, forwarder: true, customer: true }
    });
    
    if (!job) {
      return json({ detail: "Job not found" }, { status: 404 });
    }
    
    return json({ status: "success", data: job });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const { job_id } = params;
  try {
    await prisma.job.delete({ where: { id: job_id } });
    return json({ status: "success", message: "Job deleted" });
  } catch (error) {
    return json({ detail: "Job not found" }, { status: 404 });
  }
}
