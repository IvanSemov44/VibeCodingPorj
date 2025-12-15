BEST PRACTICES & RECOMMENDATIONS — 2025

How to use
- This doc records project-level best practices I will follow when you ask me to work on code, tests, infra, or reviews.
- Tell me to “apply BEST-PRACTICES-2025” in your prompt and I will read this file and align recommendations and changes to it.

Security
- Enforce least privilege for services, RBAC for infra and CI.
- Store secrets in a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault) — never in repo.
- Use automated SCA (Dependabot, Renovate) + nightly dependency audits.
- Enable strong auth: MFA, short-lived tokens, OAuth/OIDC where applicable.
- Apply CSP, XSS/CSRF mitigations, input validation and output encoding.
- Use static analysis + SAST in CI (e.g., Semgrep, SonarCloud).

Testing & Quality
- Tests: unit (fast), integration (external service mocks), E2E (select critical flows). Keep tests deterministic.
- Test isolation: use dedicated DOM root and cleanup in each test (avoid global event leaks).
- Use contract tests / provider tests for external APIs when possible.
- Require coverage thresholds per critical files; focus on branches and functions.
- Use linters and formatters (ESLint + Prettier / phpstan/pint) in pre-commit hooks.

CI/CD
- Single source-of-truth CI pipeline (yaml) with staged steps: lint -> typecheck -> unit tests -> integration -> build -> deploy.
- Use immutable artifact builds with reproducible outputs; tag builds with commit and semantic version.
- Protect main branches; require PR reviews and green CI.
- Automate canary / rollout deployments and easy rollback paths.

Observability & Reliability
- Instrument code: structured logs, traces (OpenTelemetry), and metrics (Prometheus/Grafana or managed equivalent).
- Define SLOs/SLIs and error budgets for key services.
- Centralize logs and use alerting with escalation rules (avoid noisy alerts).

Architecture & Code
- Favor small modules, single responsibility, explicit APIs; prefer composition over inheritance.
- Use typed schemas (TypeScript types, Zod) for external data boundaries.
- Keep business logic out of components; isolate effects to hooks/services.
- Prefer incremental, reversible changes (feature flags) for risky deployments.

Frontend Performance & Accessibility
- Performance: measure real users (RUM), lazy-load heavy assets, prefetch critical routes, image optimization (modern formats), and server-side rendering when needed.
- Accessibility: test with axe or jest-axe, ensure keyboard navigation, proper ARIA roles, and color-contrast checks.

Backend & Data
- Migrations: keep DB migrations in code repo, run migrations in CI/CD with backups.
- Use prepared statements/ORM with parameterization to avoid SQL injection.
- Cache thoughtfully (CDN, Redis) and invalidate consistently.

Containers & Infra
- Minimal base images, non-root processes, and layered Dockerfiles (build and runtime separation).
- Health checks, resource limits, and liveness/readiness probes in orchestrator configs.
- Infrastructure as Code (Terraform/ARM/Bicep/CloudFormation) and peer-reviewed changes.

Privacy & Compliance
- Minimize data retention; encrypt data at rest and transit.
- Maintain a data inventory and document PII flows; enable deletion/portability workflows if required.

AI / LLM Usage
- When using LLMs, avoid sending PII; redact or anonymize user data.
- Validate model outputs with deterministic checks and fallbacks; ensure human review for high-risk decisions.
- Track model use, cost, and version; pin model versions in prompts or config.

Developer Experience
- Small PRs, clear PR templates, and contextual tests with reproducible steps.
- Local dev scripts: consistent `npm` or `make` commands; seed data for common dev flows.
- Provide a concise `CONTRIBUTING.md` and onboarding checklist.

Release & Maintenance
- Semantic versioning, changelogs (automated), and release notes.
- Schedule periodic dependency and architecture reviews.

Cost & Operations
- Monitor cloud spend; add budgets and alerts.
- Use autoscaling and right-sizing to control cost while meeting SLOs.

Minimal Checklist for PRs
- Lint and format ✅
- Typecheck ✅
- Unit tests passing ✅
- Integration tests (where applicable) ✅
- Short description + test plan in PR ✅

Notes
- Keep this document concise; expand sections in companion docs if needed.
- Tell me when you want me to apply these rules automatically (e.g., "apply BEST-PRACTICES-2025 to current PR").


---
Generated: 2025-12-14
