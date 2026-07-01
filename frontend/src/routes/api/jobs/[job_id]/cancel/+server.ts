import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function PATCH({ params }) {
  const { job_id } = params;
  try {
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
