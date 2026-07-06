# API Contract Test Template

Use this template to add route-level API contract tests that validate status codes and response shapes.

## File Naming

- Place tests in: `src/routes/api/__tests__/`
- Use a name like: `<domain>-contracts.test.ts`

## Coverage Checklist

- [ ] Success contract (`200`) with exact expected payload shape
- [ ] Unauthorized contract (`401`) when auth is missing
- [ ] Forbidden contract (`403`) for wrong role/ownership
- [ ] Validation or bad-input contract (`400`) where applicable
- [ ] Not-found contract (`404`) where applicable
- [ ] Failure-mode contract (`500`) for upstream/internal errors

## Recommended Test Skeleton

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDependencyA,
  mockDependencyB
} = vi.hoisted(() => ({
  mockDependencyA: vi.fn(),
  mockDependencyB: vi.fn()
}));

vi.mock('$lib/server/someDependency', () => ({
  someDependency: {
    methodA: mockDependencyA,
    methodB: mockDependencyB
  }
}));

// Optional: mock external network calls
const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));
vi.stubGlobal('fetch', mockFetch);

// Import handlers after mocks
import { GET, POST, PATCH, DELETE } from '../your-endpoint/+server';

function auth(userId: string | null, role: 'ADMIN' | 'CUSTOMER' | 'FORWARDER' | null) {
  return { locals: { auth: { userId, role } } } as any;
}

describe('your endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const response = await GET(auth(null, null));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 200 success contract', async () => {
    mockDependencyA.mockResolvedValueOnce([{ id: 'x1' }]);

    const response = await GET(auth('user_1', 'CUSTOMER'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'success',
      data: [{ id: 'x1' }]
    });
  });

  it('returns 400 for invalid payload', async () => {
    const request = new Request('http://localhost/api/example', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST({ request, ...auth('user_1', 'CUSTOMER') } as any);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Invalid payload' });
  });

  it('returns 500 on upstream failure', async () => {
    mockDependencyB.mockRejectedValueOnce(new Error('upstream failed'));

    const request = new Request('http://localhost/api/example', {
      method: 'POST',
      body: JSON.stringify({ field: 'value' })
    });

    const response = await POST({ request, ...auth('user_1', 'CUSTOMER') } as any);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'upstream failed' });
  });
});
```

## Authoring Rules

1. Assert both status code and JSON payload contract.
2. Keep assertions strict for stable contract behavior.
3. Prefer route-level behavior tests over implementation details.
4. Mock deterministic values; avoid live database/network calls.
5. Keep each test focused on one contract branch.

## Run Commands

```sh
npm run test
npm run check
```
