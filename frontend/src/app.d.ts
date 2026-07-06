// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: {
				isAuthenticated: boolean;
				userId: string | null;
				role: 'ADMIN' | 'CUSTOMER' | 'FORWARDER' | null;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
