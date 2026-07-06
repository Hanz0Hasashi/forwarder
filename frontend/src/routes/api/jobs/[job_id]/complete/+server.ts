import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params, url, locals }) {
  const { job_id } = params;
  const damage = url.searchParams.get("damage") || "no";
  
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingJob = await prisma.job.findUnique({ where: { id: job_id } });
    if (!existingJob) {
      return json({ detail: 'Job not found' }, { status: 404 });
    }

    if (role !== 'ADMIN' && existingJob.forwarderId !== userId) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    const damageReport = damage === "yes" 
      ? "⚠️ AI Flagged: Damage Detected New scratch detected on Left Side." 
      : "✅ AI Cleared: No Damage Detected Vehicle matches original condition. Job complete.";
      
    const updatedJob = await prisma.job.update({
      where: { id: job_id }, 
      data: {
        status: "Completed",
        aiReasoning: damageReport
      }
    });
    return json({ message: "Job marked as completed", data: updatedJob });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
