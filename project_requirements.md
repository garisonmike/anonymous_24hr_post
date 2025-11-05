# ✅ Project Requirements — COMPLETED

**STATUS: All requirements have been successfully implemented!**

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for the complete implementation details.

---

# Original Requirements (Below)

## Purpose
Build an anonymous social website where users can create accounts (email+password for authentication) but publish posts, comments and likes under ephemeral, randomly generated identities that last only for 24 hours (per-post identity). All posts auto‑expire and are deleted after 24 hours.


## Core goals
- Give people a safe place to express feelings and thoughts without persistent identity.
- Each post/comment/like is tied to a random ephemeral identity that is unique to that post and expires with it.
- No personal data should be displayed to other users or admins; only the ephemeral identity is visible.
- Offensive words are masked mid‑word (example: “fuck” → “f**k”).
- No phone numbers or external links allowed in posts.
- Posts auto‑delete after 24 hours.


## Non‑functional requirements
- High availability, scalable (React + Django + PostgreSQL + Redis recommended).
- Security first: HTTPS, strong password hashing (Argon2 or bcrypt), CSRF protection, input sanitization, rate limiting.
- Privacy: minimize PII retention. Store only what is necessary. Implement data-retention and lawful‑request policies.
- Moderation: reports flow for flagged content; admins can remove content but cannot see users' real PII through the UI.
- Auditability and abuse handling: keep limited, encrypted access logs retained for a short, configurable time to allow abuse investigation while respecting user privacy — follow local law and terms of service.


## Key features
- Account registration (email + password; email verification optional). Emails hashed/encrypted at rest.
- Post creation (text only): generates ephemeral identity for the post. Client prevents links and phone numbers via validation; server enforces rules.
- Commenting & liking: each comment/like receives its own ephemeral identity for that comment or like (again per post), or reuse post identity for comments on that post if desired.
- Profanity/hate‑speech masking: a configurable word list where the backend replaces a subset of middle letters with asterisks.
- Flagging/reporting system: users can report; admins review flagged content (no PII in admin view).
- Auto‑deletion worker: background job removes posts/comments/identities after 24 hours and purges related ephemeral data.
- Rate limiting and anti‑spam measures: per‑email and per‑IP rate limits, per‑resource throttling. (See legal note below.)


## Security & Privacy note (important)
We will prioritize privacy-by-design, but **we will not assist or design features intended to help users evade lawful investigation or law enforcement**. To balance privacy and safety, retain a minimal, encrypted audit trail for a **short configurable period** (e.g., 7–30 days) to allow abuse investigations or to comply with legal subpoenas. Make retention periods and access policies transparent in the privacy policy.


## Technology choices (summary)
- Frontend: React (Next.js optional) with client-side validation and content sanitization.
- Backend: Django + Django REST Framework.
- DB: PostgreSQL for persistent data.
- Cache/ephemeral store: Redis for session state and ephemeral identity mapping (fast expiry support).
- Background jobs: Celery + Redis or Django Q for scheduled deletions.
- Reverse proxy: Nginx; app server: Gunicorn / uvicorn.
- Containerization: Docker + docker-compose for development; Kubernetes or managed hosting for production.


## Deliverables
- Working web app with features above.
- Admin moderation dashboard (no PII shown) and flagging workflow.
- Tests: unit tests for API, integration tests for auth and posting, and load tests for scalability.
- Documentation: README, deployment guide, security & privacy policy, and the project files (planning.md, tasks.md, summary.md).