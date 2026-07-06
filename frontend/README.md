# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --install npm frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Testing

Run the full test suite:

```sh
npm run test
```

Run type and Svelte diagnostics:

```sh
npm run check
```

## API Contract Tests

This project uses endpoint-level contract tests to validate each API route's behavior at the handler boundary.

### Coverage Goals

- Status-code contracts: `200`, `400`, `401`, `403`, `404`, `500`
- Response-shape contracts: required keys like `status`, `data`, `error`, `detail`, `message`
- Authorization contracts: unauthenticated, wrong-role, and owner-vs-non-owner flows
- Failure-mode contracts: upstream service failures and internal exceptions

### Current Contract Test Files

- [src/routes/api/__tests__/api-auth.integration.test.ts](src/routes/api/__tests__/api-auth.integration.test.ts)
- [src/routes/api/__tests__/endpoint-contracts.test.ts](src/routes/api/__tests__/endpoint-contracts.test.ts)
- [src/routes/api/__tests__/bid-lifecycle-users-contracts.test.ts](src/routes/api/__tests__/bid-lifecycle-users-contracts.test.ts)
- [src/routes/api/__tests__/driver-authsync-failure-contracts.test.ts](src/routes/api/__tests__/driver-authsync-failure-contracts.test.ts)

### Pattern Used in Route Contract Tests

1. Mock dependencies at module level (Prisma, external AI clients, and fetch calls).
2. Import route handlers after mocks are declared.
3. Build minimal route event objects (`request`, `params`, `locals.auth`) for each scenario.
4. Assert both status code and JSON payload contract.
5. For scoped access, also assert the query/filter inputs sent to mocked Prisma calls.

### Adding a New Endpoint Contract Test

1. Create a new spec under [src/routes/api/__tests__](src/routes/api/__tests__).
2. Add one test per contract branch:
	- success path
	- auth/role rejection path
	- validation/not-found path
	- external/internal failure path
3. Keep expected payload assertions strict and explicit.
4. Run:

```sh
npm run test
npm run check
```

### Conventions

- Prefer deterministic mocks over live network/database calls.
- Keep tests focused on route contracts, not UI behavior.
- Use concise test names describing endpoint + branch + expected status.
