# Development Instructions

## Database constraints
- Do not use JSON column types in the database schema.
- Use string/text columns for payload storage when a raw payload needs to be persisted.
- Avoid introducing schema changes that depend on JSON support if the current database engine does not support it.

## PayHero payment flow
- Keep payment processing secure and authenticated-user based.
- Do not trust client-supplied identity, amount, or plan values.
- Prefer deterministic server-side plan resolution and idempotent callback handling.
