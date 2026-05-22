# Water Bottle Tracker System

A full-stack water bottle tracking app with:

- Express backend API
- React + TypeScript + Vite frontend
- MongoDB persistence when `MONGO_URI` is configured
- In-memory fallback when MongoDB is not configured
- Monthly entries, summaries, price history, PDF export, and Excel export

## Prerequisites

Install these first:

- Node.js 20 or newer
- npm
- MongoDB, only if you want saved data after restart

If MongoDB is not configured, the backend still starts and stores data in memory for the current run.

## Project Structure

```text
.
|-- package.json
|-- scripts/
|-- src/
|   |-- backend/
|   |   |-- .env.example
|   |   |-- package.json
|   |   `-- server.js
|   `-- frontend/
|       |-- .env.example
|       |-- package.json
|       `-- src/
`-- README.md
```

## Installation

From the project root:

```bash
npm install --prefix src/backend
npm install --prefix src/frontend
```

Or install both with the root helper script:

```bash
npm run install:all
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd`:

```bash
npm.cmd run install:all
```

## Environment Setup

Create backend `.env`:

```bash
copy src\backend\.env.example src\backend\.env
```

Edit `src/backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/water-bottle-tracker
PORT=5000
```

For temporary in-memory data, leave `MONGO_URI` empty:

```env
MONGO_URI=
PORT=5000
```

Create frontend `.env`:

```bash
copy src\frontend\.env.example src\frontend\.env
```

Default frontend API config:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Start The Project

Start backend and frontend together from the root:

```bash
npm run dev
```

Windows PowerShell alternative:

```bash
npm.cmd run dev
```

The app will run at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Backend health check: `http://localhost:5000/`

## Start Separately

Backend only:

```bash
npm run dev --prefix src/backend
```

Frontend only:

```bash
npm run dev --prefix src/frontend
```

Production backend start:

```bash
npm start
```

Frontend production build:

```bash
npm run build --prefix src/frontend
```

## Useful API Endpoints

- `POST /api/entries/add`
- `GET /api/entries/month?month=5&year=2026&page=1&limit=6`
- `PUT /api/entries/update/:id`
- `DELETE /api/entries/delete/:id`
- `GET /api/summary?month=5&year=2026`
- `POST /api/price/set`
- `GET /api/price/current`
- `GET /api/price/history`
- `GET /api/pdf/monthly?month=5&year=2026`
- `GET /api/export/monthly?month=5&year=2026&type=xlsx`

## Notes

- If backend runs on a different port, update `VITE_API_BASE_URL` in `src/frontend/.env`.
- Restart the frontend after changing any Vite `.env` value.
- In-memory data is lost whenever the backend restarts.
- MongoDB data is persistent when `MONGO_URI` points to a running MongoDB server.
