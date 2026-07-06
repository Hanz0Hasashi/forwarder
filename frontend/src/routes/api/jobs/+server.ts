import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ locals }) {
  try {
    const { userId, role } = locals.auth;
    if (!userId || !role) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any =
      role === 'ADMIN'
        ? {}
        : role === 'FORWARDER'
          ? {
              OR: [
                { status: 'Reviewing' },
                { forwarderId: userId },
                { bids: { some: { forwarderId: userId } } }
              ]
            }
          : { customerId: userId };

    const rawJobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    return json({ status: "success", count: rawJobs.length, data: rawJobs });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
