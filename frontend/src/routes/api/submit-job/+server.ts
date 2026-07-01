import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { evaluateJob } from '$lib/server/ai/intakeAgent';

export async function POST({ request }) {
  try {
    const jobData = await request.json();
    console.log("Received job submission. Handing over to Intake Agent...");
    
    const aiEvaluation = await evaluateJob(jobData);
    
    let custId = jobData.customerId;
    if (custId) {
      const userExists = await prisma.user.findUnique({ where: { id: custId } });
      if (!userExists) {
        let emailToUse = jobData.customerEmail || `user_${custId}@placeholder.com`;
        const nameToUse = jobData.customerName || "Customer";
        
        const existingByEmail = await prisma.user.findUnique({ where: { email: emailToUse } });
        if (existingByEmail) {
          emailToUse = `user_${custId}_${existingByEmail.id.substring(0, 4)}@placeholder.com`;
        }
        
        await prisma.user.create({
          data: {
            id: custId,
            email: emailToUse,
            name: nameToUse,
            role: "CUSTOMER"
          }
        });
      }
    }
    
    const savedJob = await prisma.job.create({
      data: {
        make: jobData.vehicle?.make || "Unknown",
        model: jobData.vehicle?.model || "Unknown",
        year: parseInt(jobData.vehicle?.year || "0", 10),
        runs: jobData.vehicle?.runs || "unknown",
        notes: jobData.vehicle?.notes || "",
        pickup: jobData.route?.pickup || "Unknown",
        delivery: jobData.route?.delivery || "Unknown",
        distance: jobData.route?.distance || "Unknown",
        aiIsValid: aiEvaluation.is_valid,
        aiReasoning: aiEvaluation.reasoning,
        aiComplexity: aiEvaluation.estimated_complexity,
        targetPrice: jobData.targetPrice || 500.0,
        customerId: custId || null,
        status: "Reviewing" 
      }
    });
    
    return json({
      status: "success",
      message: "Job processed and saved to database",
      job_number: savedJob.jobNumber,
      job_id: savedJob.id,
      ai_analysis: aiEvaluation
    });
  } catch (error: any) {
    console.error("Error submitting job:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
