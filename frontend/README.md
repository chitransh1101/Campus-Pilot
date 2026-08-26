# CampusPilot Frontend

The React UI for CampusPilot, wired to the real FastAPI backend (no more mock/in-memory data — every screen reads and writes through real API calls, with real JWT login).

## Run it

You need the backend running first (in its own folder, its own terminal tab):

```
cd campuspilot_backend
uvicorn app.main:app --reload --port 8000
```

Then, in a **separate terminal tab**, from this frontend folder:

```
npm install
npm run dev
```

Vite will print a local URL — normally:

```
http://localhost:5173
```

Open that in your browser. You should land on the CampusPilot login screen, backed by whatever data is currently seeded in the backend.

## Demo logins

```
Student : rohan@campuspilot.edu / student123   (any student email works, all use student123)
Faculty : priya@campuspilot.edu / teach123      (also arjun@, ritu@, aditya@, vikram@, sneha@)
Admin   : admin@campuspilot.edu / admin123      (also rakesh@)
```

## If the backend isn't at http://127.0.0.1:8000

Open `index.html` and add this line inside `<head>`, before the `<script type="module" src="/src/main.jsx">` tag, pointing at wherever the backend actually runs:

```html
<script>window.__CAMPUSPILOT_API__ = "http://127.0.0.1:8000";</script>
```

## Recent updates (comment cleanup + auth/grievance/OCR/Copilot improvements)

- **Campus Copilot chat now understands more.** Teacher can ask about grievances, timetable, and subject-request status (previously dead ends); Admin can ask about courses/subject requests; Student gained a library question. Small talk ("hi", "thanks", "what can you do") gets a friendly reply instead of the generic fallback. It's still an honest scripted/keyword assistant reading your real data — not a connected LLM (that's a bigger change needing an API key, ask if you want it).
- **Attendance OCR now actually uploads and reads your photo** (previously the file picker captured a photo but silently never sent it anywhere — every upload always got simulated data no matter what). See `campuspilot_backend/README.md` → "Real attendance OCR setup" to install Tesseract-OCR and get real detection; without it, the flow still works with simulated data and now honestly says so in the UI.

- **Sessions now survive a page refresh.** The backend gained a `GET /auth/me` endpoint; on load, the app uses a saved token to restore your login instead of always showing the login screen. An expired/invalid token is cleared automatically and bounces you back to login (previously it just kept failing silently).
- **Grievances have an optional "Contact email" field**, validated as a Gmail address (`name@gmail.com`) both in the browser and on the server, so admin/teacher have a way to reply. Leave it blank to skip.
- **Signup and admin-created accounts now validate email format server-side** (not just in the browser) and signup enforces the 4-character password minimum server-side too.
- **⚠️ Because of the new "Contact email" field, you need to delete `campuspilot.db` and re-run `python seed.py` one more time** after pulling this update — the database needs the new column. Same steps as before: stop `uvicorn`, delete the db file, reseed, restart.
- Source comments were stripped from `App.jsx` for a cleaner handoff copy; behavior is unchanged (verified by bundling and loading the module before and after).

## What changed from the old mock version

`src/App.jsx`'s `api` object used to be a fully in-memory mock (fake data, fake delays, plaintext passwords compared client-side). It's now a thin wrapper around `fetch()` calls to the backend:

- Real JWT auth — `api.auth.login()`/`signup()` get a token from the server; every other call sends it as `Authorization: Bearer <token>`.
- Real persistence — every list/create/update is a real HTTP call against the backend's SQLite database.
- Same function names and arguments as before, so no other part of the UI needed to change.

A couple of small, known limitations worth knowing about:

- **Leave requests** now honestly stay "pending" — the old mock faked an auto-approve/reject after a few seconds, but there's no real backend endpoint yet for an admin to act on leave requests.
- **The "Notice Board" widget** on the student dashboard (and the Copilot's "any new notices?" answer) isn't backed by a real endpoint — it only reflects notices sent during the current browser session, same as most of the original mock's placeholder content.
- Cross-tab / cross-device live sync still isn't real — updates you make show up instantly in the tab you're using (same as before), but the backend doesn't push updates to other open tabs. Refreshing picks up anything another tab or user changed.
