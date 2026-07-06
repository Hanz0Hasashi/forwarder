import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDriverRequestFindMany,
  mockDriverRequestFindFirst,
  mockDriverRequestCreate,
  mockDriverRequestFindUnique,
  mockDriverRequestDelete,
  mockUserFindUnique,
  mockUserUpdate,
  mockUserUpsert,
  mockJobFindUnique,
  mockBidCreate,
  mockBidUpdate,
  mockEvaluateDriverBid,
  mockFetch
} = vi.hoisted(() => ({
  mockDriverRequestFindMany: vi.fn(),
  mockDriverRequestFindFirst: vi.fn(),
  mockDriverRequestCreate: vi.fn(),
  mockDriverRequestFindUnique: vi.fn(),
  mockDriverRequestDelete: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockUserUpsert: vi.fn(),
  mockJobFindUnique: vi.fn(),
  mockBidCreate: vi.fn(),
  mockBidUpdate: vi.fn(),
  mockEvaluateDriverBid: vi.fn(),
  mockFetch: vi.fn()
}));

vi.mock('$lib/server/prisma', () => ({
  prisma: {
    driverRequest: {
      findMany: mockDriverRequestFindMany,
      findFirst: mockDriverRequestFindFirst,
      create: mockDriverRequestCreate,
      findUnique: mockDriverRequestFindUnique,
      delete: mockDriverRequestDelete
    },
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
      upsert: mockUserUpsert
    },
    job: {
      findUnique: mockJobFindUnique
    },
    bid: {
      create: mockBidCreate,
      update: mockBidUpdate
    }
  }
}));

vi.mock('$lib/server/ai/brokerAgent', () => ({
  evaluateDriverBid: mockEvaluateDriverBid
}));

vi.mock('$env/dynamic/private', () => ({
  env: {
    CLERK_SECRET_KEY: 'sk_test_123'
  }
}));

vi.stubGlobal('fetch', mockFetch);

import { GET as getDriverRequests, POST as postDriverRequest } from '../driver-requests/+server';
import { POST as approveDriverRequest } from '../driver-requests/[id]/approve/+server';
import { POST as rejectDriverRequest } from '../driver-requests/[id]/reject/+server';
import { POST as postAuthSync } from '../auth-sync/+server';
import { POST as postBid } from '../jobs/[job_id]/bids/+server';

function auth(userId: string | null, role: 'ADMIN' | 'CUSTOMER' | 'FORWARDER' | null) {
  return { locals: { auth: { userId, role } } } as any;
}

describe('driver-request endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/driver-requests returns success contract', async () => {
    const rows = [{ id: 'req_1', email: 'driver@example.com' }];
    mockDriverRequestFindMany.mockResolvedValueOnce(rows);

    const response = await getDriverRequests();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', data: rows });
  });

  it('POST /api/driver-requests returns 400 for invalid payload', async () => {
    const request = new Request('http://localhost/api/driver-requests', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'A' })
    });

    const response = await postDriverRequest({ request } as any);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toBe('Invalid application payload');
  });

  it('POST /api/driver-requests returns duplicate-email contract', async () => {
    const request = new Request('http://localhost/api/driver-requests', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Driver',
        email: 'driver@example.com',
        phone: '1234567',
        licenseClass: 'CE',
        trailerType: 'Flatbed',
        hasWinch: true,
        hasCode95: true
      })
    });

    mockDriverRequestFindFirst.mockResolvedValueOnce({ id: 'req_existing' });

    const response = await postDriverRequest({ request } as any);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ detail: 'Application already submitted with this email.' });
  });

  it('POST /api/driver-requests/[id]/approve returns 404 for missing request', async () => {
    mockDriverRequestFindUnique.mockResolvedValueOnce(null);

    const response = await approveDriverRequest({
      params: { id: 'missing' },
      url: new URL('http://localhost/admin/drivers')
    } as any);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ detail: 'Application not found' });
  });

  it('POST /api/driver-requests/[id]/approve returns 400 on Clerk failure', async () => {
    mockDriverRequestFindUnique.mockResolvedValueOnce({
      id: 'req_1',
      email: 'driver@example.com'
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'bad clerk request'
    });

    const response = await approveDriverRequest({
      params: { id: 'req_1' },
      url: new URL('http://localhost/admin/drivers')
    } as any);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toContain('Failed to create Clerk account');
  });

  it('POST /api/driver-requests/[id]/reject returns success contract', async () => {
    mockDriverRequestFindUnique.mockResolvedValueOnce({ id: 'req_1' });
    mockDriverRequestDelete.mockResolvedValueOnce({ id: 'req_1' });

    const response = await rejectDriverRequest({ params: { id: 'req_1' } } as any);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', message: 'Driver request rejected.' });
  });
});

describe('auth-sync and failure-mode contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth-sync returns 401 without authenticated user', async () => {
    const request = new Request('http://localhost/api/auth-sync', {
      method: 'POST',
      body: JSON.stringify({ role: 'admin', email: 'x@example.com' })
    });

    const response = await postAuthSync({ request, ...auth(null, null) } as any);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('POST /api/auth-sync returns success contract', async () => {
    const request = new Request('http://localhost/api/auth-sync', {
      method: 'POST',
      body: JSON.stringify({ role: 'employee', email: 'x@example.com', name: 'X User' })
    });

    mockUserFindUnique.mockResolvedValueOnce(null);
    const upsertedUser = { id: 'user_1', role: 'FORWARDER', email: 'x@example.com' };
    mockUserUpsert.mockResolvedValueOnce(upsertedUser);

    const response = await postAuthSync({ request, ...auth('user_1', 'CUSTOMER') } as any);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'success', data: upsertedUser });
  });

  it('POST /api/jobs/[job_id]/bids returns 500 on AI evaluation failure', async () => {
    const request = new Request('http://localhost/api/jobs/job_1/bids', {
      method: 'POST',
      body: JSON.stringify({ amount: 500, driverName: 'Driver A' })
    });

    mockJobFindUnique.mockResolvedValueOnce({
      id: 'job_1',
      status: 'Reviewing',
      make: 'BMW',
      model: 'X5',
      targetPrice: 600
    });
    mockBidCreate.mockResolvedValueOnce({ id: 'bid_1' });
    mockEvaluateDriverBid.mockRejectedValueOnce(new Error('AI offline'));

    const response = await postBid({
      request,
      params: { job_id: 'job_1' },
      ...auth('fwd_1', 'FORWARDER')
    } as any);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'AI offline' });
  });
});
