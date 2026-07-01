import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ request, params, url }) {
  const { job_id } = params;
  const damage = url.searchParams.get("damage") || "no";
  
  try {
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
