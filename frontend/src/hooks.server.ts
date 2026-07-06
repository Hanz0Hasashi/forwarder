import { createClerkClient } from '@clerk/backend';
import { json, type Handle } from '@sveltejs/kit';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { prisma } from '$lib/server/prisma';
import {
  hasRequiredRole,
  isPublicApiRoute,
  normalizeRole,
  requiredRolesForRoute
} from '$lib/server/apiAuth';

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const method = event.request.method.toUpperCase();

  event.locals.auth = {
    isAuthenticated: false,
    userId: null,
    role: null
  };

  if (!pathname.startsWith('/api')) {
    return resolve(event);
  }

  if (isPublicApiRoute(pathname, method)) {
    return resolve(event);
  }

  if (!CLERK_SECRET_KEY) {
    return json({ error: 'Authentication is not configured on the server.' }, { status: 500 });
  }

  const clerk = createClerkClient({
    secretKey: CLERK_SECRET_KEY,
    publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY
  });

  const requestState = await clerk.authenticateRequest(event.request, {
    authorizedParties: [event.url.origin]
  });

  if (!requestState.isAuthenticated) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth = requestState.toAuth();
  const userId = auth.userId;

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Allow provisioning to happen through auth-sync for first-time users.
  const effectiveRole = user ? normalizeRole(user.role) : pathname === '/api/auth-sync' ? 'CUSTOMER' : null;
  if (!effectiveRole) {
    return json({ error: 'User is not provisioned. Please re-sync your account.' }, { status: 403 });
  }

  const requiredRoles = requiredRolesForRoute(pathname, method);
  if (!hasRequiredRole(effectiveRole, requiredRoles)) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  event.locals.auth = {
    isAuthenticated: true,
    userId,
    role: effectiveRole
  };

  return resolve(event);
};
