# Remove account email verification

Objective: Remove account email verification from the backend and frontend while preserving password reset.
Branches: backend `feat/remove-account-verification`; frontend `feat/remove-account-verification` | Delivery: `ask-on-risk`
Runner: backend `npm run build`, `npm test -- --runInBand`; frontend `npm run build`, focused `npx eslint`

## Specs

### S1 — Remove account verification

User request, verbatim: "bien ahora hagamos lo siguiente, quisiera que eliminaras eso de verificar cuenta, poorque ya no lo vamos a necesitar, elimna eso de la entidad de usuario y todo rastro de eso del frontend y del backend, osae ya eso de verificar cuenta no estará, también quita el envío de emails para verificar cuenta."

Acceptance criteria:
- Remove the user email-verification field from backend schemas/DTOs and frontend response schemas/UI.
- Remove account-confirmation endpoints, token handling, screens, client methods, email types/templates, and confirmation mail sends.
- Registration no longer creates confirmation tokens or sends confirmation email; do not add a new email-verification login gate.
- Existing password-reset endpoints, token type, templates, frontend pages, and email delivery continue to work.
- Other user creation, role, and account behavior remains unchanged.

### S2 — Preserve password reset

User request, verbatim: "ojo solo para verificar, lo de restablecer contraseña si dejalo"

Acceptance criteria: forgot-password, reset-password, password-reset tokens, their email template and mail provider remain present and functional. Keep their tests.

### S3 — Existing persisted verification values

User decision, verbatim: "Conservarlos (recomendado)"

Acceptance criteria: stop reading/writing `emailValidated` in application schemas and APIs, but do not migrate or unset that field from existing MongoDB documents. Suppress any legacy value from API JSON responses. Existing confirmation tokens use the existing five-minute TTL and are not explicitly deleted by a migration.

Checks: Backend build and unit suite; frontend build and focused ESLint on changed files. No frontend test script is configured. Verify reset-password tests remain.

## Tasks

- T1 — S1, S2, S3 — Inline — Complete — Remove backend field/registration verification, confirmation endpoint/token handling, and seed behavior; commit `609f29f`.
- T2 — S1, S2, S3 — Inline — Complete — Remove dormant backend confirmation email types/templates and related tests; preserve reset template; commit `0ffb423`.
- T3 — S1, S2, S3 — Inline — Complete — Remove frontend confirmation route/page/API/schema/UI; preserve reset flows and run cross-repository checks; commit pending.

## Log

### L1 — Original request

bien ahora hagamos lo siguiente, quisiera que eliminaras eso de verificar cuenta, poorque ya no lo vamos a necesitar, elimna eso de la entidad de usuario y todo rastro de eso del frontend y del backend, osae ya eso de verificar cuenta no estará, también quita el envío de emails para verificar cuenta. ojo solo para verificar, lo de restablecer contraseña si dejalo

### L2 — Persisted-data decision

The user chose `Conservarlos (recomendado)`: legacy `emailValidated` values stay in existing MongoDB documents but are no longer read or written by the app. No migration/unset will be run.

### L3 — Baseline and mapping

- Backend baseline: `dfa9678`; frontend baseline: `7a48835`. Both repositories were clean on `main`.
- Backend registration creates a confirmation token and email; login does not check `emailValidated`. Password reset uses the same mail/token infrastructure and must be preserved.
- Frontend confirmation route and schema/UI references must be removed; reset routes remain.
- Existing confirmation tokens expire through the token schema's five-minute TTL; no explicit token cleanup is included.

### L4 — Test-first and legacy serialization

- RED: registration test failed because AuthService created a confirmation token; DTO test failed because `emailValidated` was accepted.
- Mongoose probe: hydrating a legacy document with an unknown `emailValidated` property still included it in `toJSON()`, even after removing the schema path. Added a JSON serialization transform to hide that legacy field without changing the stored MongoDB document.
- `src/user/entities/user.entity.spec.ts` observed RED before the transform and GREEN after it; it asserts the legacy value remains in the in-memory document but is absent from API JSON.

### L5 — T1 backend verification

- Registration now saves the user without creating a token or sending mail. The confirm-email controller/service, confirmation token type, seed field, and related confirmation-flow tests are removed. Dormant confirmation email types/templates remain for T2. Password-reset behavior and tests remain.
- The Mongoose `User` schema no longer declares `emailValidated`; its JSON transform suppresses legacy values while leaving stored documents unchanged, as requested.
- Parent worktree `npm test -- --runInBand` — 33 suites / 179 tests passed. Independent verification of commit `609f29f` in scratch — 33 suites / 181 tests passed; `npm run build` passed. Prettier and targeted production ESLint checks passed.
- `npm run test:e2e -- --runInBand --testNamePattern="ya no expone el endpoint de confirmación"` — unavailable: the E2E app could not connect to local MongoDB (`ECONNREFUSED 127.0.0.1:27017`) before tests ran. The E2E regression assertions are present but unverified in this environment.
- The registration/no-verification and obsolete-field DTO tests produced RED before implementation and GREEN afterward. The endpoint removal is implemented in the controller; its HTTP 404 E2E assertion remains unverified because the E2E database is unavailable.
- T1 work-unit commit: `609f29f` (`fix(auth): register users without account verification`). The e2e attempt was made before backend implementation and could not connect to the local MongoDB service.

### L6 — Delivery threshold

- Backend T1 contains approximately 368 authored source/test lines when the new untracked test is included; the full cross-repository feature forecast exceeds the approximate 400-line threshold.
- The user selected `stacked-to-main` before the first commit. No PR or push is authorized or planned in this task.

### L7 — Delivery strategy

- User selected `stacked-to-main` before the first commit. Backend core removal, backend confirmation transport/artifacts, and frontend cleanup are separate candidate slices. No PR or push is authorized or planned in this task.

### L8 — T1 native review

- Native assessment classified commit `609f29f` high risk because it changes the authentication hot path. The user granted candidate review; native review `review-8a6de1c305e50c35` was approved and exactly acknowledged. No reviewer findings were reported.

### L9 — T2 backend mail cleanup

- Removed the confirmation/resend email types, helper branches, template methods, and their tests. The reset-password email type, helper, template, and tests remain.
- `npm test -- --runInBand` — 33 suites / 179 tests passed. `npm run build` — passed. Prettier check and targeted ESLint on production files — passed.
- Backend source scan found no active account-verification references; intentional negative regression checks and the legacy JSON-suppression compatibility shim remain.
- T2 work-unit commit: `0ffb423` (`refactor(mail): remove account confirmation templates`). Native assessment against `609f29f`: medium, `review_due=false` (`under_budget`), 229 changed lines.

### L10 — T3 frontend verification

- Removed the confirmation route/page, client/store/hook method, validation fields, email-status indicators, and static profile-verification markers. Forgot/reset-password routes and calls remain unchanged.
- Frontend `git grep` found no active references to account verification. `npm run build` — passed; focused ESLint on changed files — passed. No frontend test script is configured.
- Backend unit suite and build remain green. Backend E2E verification remains unavailable because local MongoDB was not running.
- Parent baseline check: the role-route changes in `PrivateLayout.tsx`, `PublicLayout.tsx`, `app-sidebar.tsx`, and `app-role-routes.ts` already exist at frontend baseline `7a48835`; they are not part of this feature diff.
