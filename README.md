# F1 Simulator

A Formula 1 telemetry simulation dashboard built with Next.js and Flask.

## Pages

- **Home** — Landing page
- **Simulation** — Live telemetry charts (chassis, G-force, power unit, tyres)
- **Dashboard** — Speedometer gauges and tyre temperature widget
- **Alerts** — Full alert log with filtering

## Tech Stack

- **Frontend** — Next.js, Recharts, Tailwind CSS
- **Backend** — Flask, Python

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # on Windows: .venv\Scripts\activate
pip install flask flask-cors
```

### Frontend

```bash
cd frontend/simulator
npm install
```

Create a `.env.local` file inside `frontend/simulator` with:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

(Copy `.env.example` if present, and update the URL if your backend runs on a different host/port.)

## Running the project

### Backend

```bash
cd backend
source .venv/bin/activate      # if not already active
python app.py
```

Runs on `http://127.0.0.1:5000` by default.

### Frontend

```bash
cd frontend/simulator
npm run dev
```

Runs on `http://localhost:3000` by default. Open this in your browser (not `0.0.0.0`).

## Notes

- The backend requires `flask-cors` since the frontend and backend run on different ports (CORS is needed for the browser to allow requests between them).
- Don't commit `.venv/`, `node_modules/`, `.next/`, or `.env.local` — these are environment/machine-specific and are excluded via `.gitignore`.
- If `npm run dev` fails with `next: not found`, your frontend dependencies didn't install correctly — delete `node_modules` and `package-lock.json`, then re-run `npm install`.
