# MetaMorph.AI

**Intelligence Content Transformation Engine** — SIH26154 · NTRO · Blockchain & Cybersecurity

One trusted source in, several audience-specific artefacts out, every sentence traceable to where it came from.

Repository: [github.com/MdFareedKhan01/sih_ps154](https://github.com/MdFareedKhan01/sih_ps154) — **public**, so everything committed here can be read by anyone.

Status: building the Phase 1 prototype for the 30 September idea submission. The specification is [docs/final/SIH26154-SRS-Final.md](docs/final/SIH26154-SRS-Final.md); each member builds from it and from their own guide.

## Repository layout

```text
apps/
  server/        Express API + BullMQ worker                  B
  web/           React + Vite client                          C
packages/
  shared/        Zod schemas used by client and server        all four, by agreement
  ai/            the engine: routing, formats, verifier       D
prisma/          schema, seed, audit trigger (Guide B Step 2) B
samples/         synthetic demo and test sources              D
docs/final/      the SRS and the four member guides           A
.github/         CI, pull request template, CODEOWNERS        B
```

**One folder, one owner.** `packages/shared` is the contract between everyone's code: change it only after telling the other three.

It is a [Turborepo](https://turborepo.com) monorepo over npm workspaces: one `npm install`, one lockfile, and tasks that run across every package from the root.

## Documents

| Document | Read by |
| --- | --- |
| [SRS — Final](docs/final/SIH26154-SRS-Final.md) | Everyone. Where anything disagrees with it, the SRS wins |
| [Guide A — Deck & narrative](docs/final/SIH26154-Guide-A-Deck-and-Narrative.md) | A |
| [Guide B — Backend](docs/final/SIH26154-Guide-B-Backend.md) | B |
| [Guide C — Frontend](docs/final/SIH26154-Guide-C-Frontend.md) | C |
| [Guide D — AI systems](docs/final/SIH26154-Guide-D-AI-Systems.md) | D |

Each document also has an `.html` copy beside it: open it in a browser for the rendered diagrams. After editing a guide's Markdown, run `npm run docs:html` (needs [pandoc](https://pandoc.org)) so the HTML matches.

## Quick start

You need **Node 22 LTS** (20.12 or later works), **Git** and **Docker Desktop** — on Windows, with the WSL 2 backend. D also needs Ollama and a Gemini key (Guide D, Step 0).

```bash
git clone https://github.com/MdFareedKhan01/sih_ps154.git && cd sih_ps154
npm install                  # every workspace, one lockfile
cp .env.example .env         # PowerShell: Copy-Item .env.example .env
docker compose up -d         # PostgreSQL + Redis
npm run check                # typecheck, test, build: should be green
npm run dev                  # web :5173, API :8080, worker
```

Open http://localhost:5173. Until B's Steps 3 and 6 land, the API and worker are placeholders.

Once B's database step is on `main`, set up your local database once, and again whenever a PR changes `prisma/schema.prisma`:

```bash
npm run db:push && npm run db:trigger && npm run db:seed
```

The seeded logins are in Guide B, Step 2.

## Everyday commands

All from the repo root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Web, API and worker together, reloading on save |
| `npm run dev:web` · `dev:api` · `dev:worker` | Just one of them |
| `npm run check` | Typecheck, tests and web build for every package. **Run before every PR** — CI runs exactly this |
| `npm test` | Tests only |
| `npm run test:watch -w @ps154/web` | One package's tests, rerun on every save |
| `npx turbo run test --filter=@ps154/server` | One task in one package |
| `npm run smoke` | End-to-end check against the running API and worker |
| `npm run db:push` · `db:trigger` · `db:seed` | Database setup (B) |
| `npm run try -- samples/demo-incident.md public advisory` | Engine harness (D) |
| `npm run seed:pack` | The cached demo pack for offline demos (B) |
| `npm run docs:html` | Rebuild `docs/final/*.html` from the Markdown |

**Adding a dependency.** From the root: `npm i <package> -w @ps154/web` (or `@ps154/server`, `@ps154/ai`, `@ps154/shared`). Never run `npm i` inside a package folder.

**Caching.** Turborepo caches `typecheck`, `test` and `build`. A package that has not changed prints `FULL TURBO` and finishes at once; add `--force` to rerun it anyway.

## How we work: branches and pull requests

Nobody pushes to `main`. Every change arrives as a pull request with green CI and one approval.

1. `git switch main && git pull`
2. `git switch -c <area>/<topic>`, where the area is your folder: `server/ingestion`, `web/provenance`, `ai/verifier`, `shared/batch-request`, `docs/deck`
3. Build, and commit in small steps. Stage your own folder by name — `git add apps/web` — never everything at once
4. `npm run check`; for server changes, `npm run smoke` as well
5. `git push -u origin <branch>`, then open [the repository](https://github.com/MdFareedKhan01/sih_ps154), press *Compare & pull request* — or [New pull request](https://github.com/MdFareedKhan01/sih_ps154/compare) — and fill in the template. With the GitHub CLI: `gh pr create --fill --base main`
6. When CI is green and a teammate approves: **Squash and merge**, **Delete branch**, then `git switch main && git pull`

**The rules**

- One PR per guide step or screen. Small PRs get reviewed within the hour; review others' within the hour too.
- `packages/shared`: post in the team chat first. The PR needs approval from the owners it affects.
- Never commit `.env`, API keys or real operational data. Everything in `samples/` is synthetic.
- To bring a long branch up to date, `git merge origin/main`. No rebasing, no force-pushes.
- After pulling: if `package-lock.json` changed, `npm install`; if `prisma/schema.prisma` changed, `npm run db:push`.

Each guide walks through the whole flow for its owner, including who reviews what: Guide A Step 10, Guide B Step 12, Guide C Step 10, Guide D Step 9.

**Every pull request lists here:** [open pull requests](https://github.com/MdFareedKhan01/sih_ps154/pulls) · [CI runs](https://github.com/MdFareedKhan01/sih_ps154/actions).

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and every push to `main`: `npm ci`, then `npm run check`, on Ubuntu with the Node version in `.nvmrc`. A red cross on a PR links to the failing log. The fix is always the same: reproduce it with `npm run check` locally, fix, push.

## Repository settings (owner only)

The repository belongs to D, Md Fareed Khan (@MdFareedKhan01); only the owner can change its settings. The scaffold is on `main` and CI has passed on it. Still to do, once:

1. **Settings → Collaborators → Add people**: invite `@quamarfarhan007`, `@Faizan0916` and `@Rehan9599` with *Write* access, if they are not collaborators already. Each accepts from the email, or at [github.com/MdFareedKhan01/sih_ps154/invitations](https://github.com/MdFareedKhan01/sih_ps154/invitations).
2. **Settings → Rules → Rulesets → New branch ruleset**, named `main`, target the default branch, enforcement *Active*:
   - *Require a pull request before merging*, with 1 required approval
   - *Require status checks to pass*: add **typecheck, test, build**
   - *Block force pushes*

   On a public repository this costs nothing. Until it is on, `main` accepts direct pushes: keep the rule by agreement.

`.github/CODEOWNERS` already names each folder's owner, so every pull request requests the right reviewer by itself, once that person has accepted the invitation.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `node: ../../.env: not found` when the API or worker starts | Copy `.env.example` to `.env` at the repo root |
| `P1000: Authentication failed`, or a port already in use | A PostgreSQL or Redis installed on the laptop holds 5432 or 6379. In `.env`, set `PG_PORT=5433` and put 5433 in `DATABASE_URL` (Redis: `REDIS_PORT=6380` and `REDIS_URL`), then `docker compose up -d` |
| `Cannot find module '@ps154/shared'` or `@prisma/client did not initialize yet` | `npm install` at the repo root |
| CI fails but your machine passes | `npx turbo run typecheck test build --force`, and check `git status` for files you did not commit |

Each guide has a longer table for its own area.

## Data

All sample content is synthetic and labelled as such. No real operational data, indicators or incident reports belong in this repository — and because it is public, neither do `.env`, API keys or passwords. A key that reaches GitHub, even for a minute, must be revoked: deleting the commit does not unpublish it.

## Team

| Member | Role | Name | GitHub | Folder |
| --- | --- | --- | --- | --- |
| A | Deck & narrative | Rehan Fazal | [@Rehan9599](https://github.com/Rehan9599) | `docs/` |
| B | Backend | Farhan Quamar | [@quamarfarhan007](https://github.com/quamarfarhan007) | `apps/server`, `prisma/`, root config |
| C | Frontend | Faizan Ahmad Ansari | [@Faizan0916](https://github.com/Faizan0916) | `apps/web` |
| D | AI systems, repository owner | Md Fareed Khan | [@MdFareedKhan01](https://github.com/MdFareedKhan01) | `packages/ai`, `samples/` |
