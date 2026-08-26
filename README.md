# CampusPilot

A campus ERP: React frontend + FastAPI backend, wired together with real auth and a real (SQLite) database — packaged with Docker so it runs the same way on any machine, with no Python/Node install required.

```
campuspilot_deploy/
├── backend/           FastAPI + SQLAlchemy API, JWT auth, SQLite database
├── frontend/           React + Vite UI, calls the backend over fetch()
├── docker-compose.yml   Runs both together with one command
├── render.yaml          Optional: deploy both live on Render.com
└── .env.example         Copy to .env to set a few optional settings
```

## Quick start (this is the whole thing — one command)

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running. Nothing else — no Python, no Node, no Tesseract-OCR install; all of that is baked into the images.

```bash
docker compose up --build
```

The first run takes a few minutes (downloading base images, installing dependencies, building the frontend). Once it settles, open:

```
http://localhost:8080
```

Demo logins:

```
Student : rohan@campuspilot.edu / student123   (any student email works, all use student123)
Faculty : priya@campuspilot.edu / teach123      (also arjun@, ritu@, aditya@, vikram@, sneha@)
Admin   : admin@campuspilot.edu / admin123      (also rakesh@campuspilot.edu)
```

To stop it: `Ctrl+C`, then `docker compose down` (add `-v` if you also want to wipe the database and start over from the seed data).

### What's actually running

- **backend** — FastAPI on port 8000, with Tesseract-OCR installed in the image so the attendance-photo feature does real OCR out of the box (see `backend/README.md` → "Real attendance OCR setup" for how that works). Data is stored in a Docker volume so it survives restarts and rebuilds.
- **frontend** — the React app built once with Vite, then served as static files by nginx on port 8080. It's told where the backend is via an `API_BASE` setting injected when the container starts (defaults to `http://localhost:8000`, which is correct for this local setup).

## Sending this to someone else

Zip this whole folder (or better, see "Push to GitHub" below and just send them the repo link) — everything needed is inside it. All they need on their end is Docker Desktop and the one command above.

## Push to GitHub

This folder is already a git repository (`git log` to see the initial commit). To put it on GitHub:

1. Create a new **empty** repository at github.com (don't check "Add a README" — this folder already has one, and an extra one causes a conflict on first push).
2. In this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Share the repo URL — anyone who clones it and runs `docker compose up --build` gets the exact same app running.

## Going live later (a real, reachable URL)

Running locally with Docker (above) means it only works on the machine it's running on. To make it reachable at a real URL on the internet, you need a hosting provider — this repo includes `render.yaml` for [Render](https://render.com), a straightforward option with a free tier, but the same Dockerfiles work on any Docker-friendly host (Railway, Fly.io, a VPS, etc.) if you'd rather use one of those.

**Using Render + the included `render.yaml`:**

1. Push this repo to GitHub (see above) — Render deploys from a GitHub repo.
2. On Render: **New → Blueprint**, connect the repo. It reads `render.yaml` and creates two services (`campuspilot-backend`, `campuspilot-frontend`) automatically.
3. Once `campuspilot-backend` finishes deploying, copy its URL from its Render dashboard page (looks like `https://campuspilot-backend-xxxx.onrender.com`).
4. Open the `campuspilot-frontend` service → Environment → set `API_BASE` to that URL → save (this triggers a redeploy).
5. Open the frontend service's own URL — that's the real, shareable link.

**Important — free-tier data persistence:** Render's free plan doesn't support persistent disks and spins services down after 15 minutes idle, so the database quietly resets back to the seed data on every redeploy or spin-down. That's fine for sharing a live demo link; it's not fine if you need data to actually stick around. `render.yaml` has a commented-out `disk:` block and instructions for upgrading to a paid plan to fix that — do that before relying on this for anything real.

## Everything else

For the full list of what's implemented, known limitations, and demo-data details, see `backend/README.md` and `frontend/README.md` inside their respective folders.
