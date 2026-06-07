# Territory Grid — Real-Time Shared Capture Map

A multiplayer web app where users compete to claim cells on a shared **50×50** grid (2,500 blocks). Captures persist in MongoDB and sync instantly to every connected client via **Socket.IO**.

![Stack](https://img.shields.io/badge/React-18-61dafb) ![Stack](https://img.shields.io/badge/Node.js-Express-339933) ![Stack](https://img.shields.io/badge/MongoDB-8-47A248) ![Stack](https://img.shields.io/badge/Socket.IO-4-010101)

## Architecture Overview

```
┌─────────────┐     WebSocket (Socket.IO)      ┌──────────────────────────────┐
│   React     │◄──────────────────────────────►│  Express + Socket.IO Server    │
│   Frontend  │     REST /api (optional)       │  • Conflict resolution (txn)   │
│             │                                │  • Presence & broadcasts     │
└─────────────┘                                └───────────┬──────────────────┘
                                                             │
                    ┌────────────────────────────────────────┼────────────────┐
                    │                                        │                │
                    ▼                                        ▼                ▼
              ┌──────────┐                            ┌──────────┐    ┌──────────┐
              │ MongoDB  │                            │  Redis   │    │  Shared  │
              │ cells,   │                            │ pub/sub  │    │  types   │
              │ users,   │                            │ adapter  │    │ package  │
              │ activity │                            │ (scale)  │    └──────────┘
              └──────────┘                            └──────────┘
```

### Design choices

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React + Vite + Tailwind + Framer Motion | Fast dev, polished UI, smooth capture animations |
| **Backend** | Express + TypeScript | Simple HTTP API + same process hosts Socket.IO |
| **Database** | MongoDB | Flexible schema for cells/users; transactions for atomic captures |
| **Real-time** | Socket.IO | Rooms-free broadcast, ack callbacks, Redis adapter for scale |
| **Monorepo** | npm workspaces + `@territory-grid/shared` | Single source of truth for events and grid constants |

### Conflict handling

1. Client sends `cell:capture` with optimistic UI update.
2. Server runs a **MongoDB multi-document transaction**: update cell, increment capturer `cellsOwned`, decrement previous owner, bump global stats.
3. Concurrent writes on the same cell serialize at the DB — **last committed transaction wins**.
4. Server broadcasts `cell:updated` to **all** clients; losers reconcile via broadcast (not stale optimistic state).

### Horizontal scaling

- Set `REDIS_URL` to enable `@socket.io/redis-adapter`.
- Multiple backend instances share Socket.IO events through Redis pub/sub.
- MongoDB remains the source of truth; any instance can process captures.

### Optimistic UI & reconciliation

- On click, the cell is painted immediately with the user’s color.
- The server ack (`cell:capture` callback) and `cell:updated` broadcast correct mismatches.
- `leaderboard:updated` refreshes the local user’s `cellsOwned` count.

## Database schema

### `Cell`
| Field | Type | Notes |
|-------|------|-------|
| x, y | number | Unique compound index `{ x: 1, y: 1 }` |
| ownerId | string \| null | Indexed |
| ownerNickname, ownerColor | string \| null | Denormalized for fast grid sync |
| capturedAt | Date \| null | |

### `User`
| Field | Type | Notes |
|-------|------|-------|
| userId | string | UUID, unique |
| nickname | string | Max 20 chars |
| color | string | From fixed palette |
| cellsOwned | number | Indexed desc for leaderboard |
| totalCaptures | number | Lifetime captures |

### `Activity`
| Field | Type |
|-------|------|
| eventId | string |
| type | `capture` \| `takeover` \| `join` |
| message | string |
| userColor | string? |

### `Stats`
| Field | Type |
|-------|------|
| key | `"global"` |
| totalCaptures | number |

## Socket events

**Client → Server**
- `user:register` — nickname → full initial state
- `cell:capture` — `{ x, y }` → `CaptureResult`

**Server → Client**
- `cell:updated` — cell + activity event
- `leaderboard:updated`, `stats:updated`, `users:online`
- `activity:new`, `user:joined`
- `capture:failed` — reconciliation hint

## Project structure

```
proo/
├── shared/                 # Types & constants
├── backend/
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Grid, users, presence
│   │   ├── socket/         # Real-time handlers
│   │   └── routes/         # REST API
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Grid, sidebar, join screen
│   │   └── hooks/          # useSocket
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick start (local)

### Prerequisites
- Node.js 20+
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Install dependencies

```bash
cd proo
npm install
npm run build -w shared
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
```

Default `backend/.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/territory-grid
CORS_ORIGIN=http://localhost:5173, https://territory-grid-frontend.vercel.app/
REDIS_URL=
GRID_SIZE=50
```

Redis is optional for local dev.

### 3. Run

```bash
# Terminal 1 — API + WebSocket
npm run dev -w backend

# Terminal 2 — Frontend (proxies /api and /socket.io)
npm run dev -w frontend
```

Or both: `npm run dev` from the repo root (requires `concurrently`).

Open **http://localhost:5173**, pick a nickname, and open a second tab to test live sync.

## Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  
- MongoDB: 27017, Redis: 6379  

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | backend | HTTP port (default 3001) |
| `MONGODB_URI` | backend | Mongo connection string |
| `CORS_ORIGIN` | backend | Allowed browser origin |
| `REDIS_URL` | backend | Enables Socket.IO Redis adapter |
| `GRID_SIZE` | backend | Grid dimension (default 50) |
| `VITE_API_URL` | frontend | API base (empty = Vite proxy) |
| `VITE_SOCKET_URL` | frontend | Socket server URL |

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/grid` | Full grid state |
| GET | `/api/leaderboard` | Top players |
| GET | `/api/stats` | Global stats |
| GET | `/api/activity` | Recent events |

## Features implemented

- ✅ 50×50 grid (2,500 cells)
- ✅ Nickname + random color on join
- ✅ Real-time capture sync
- ✅ MongoDB transactions for conflicts
- ✅ Leaderboard, stats, activity feed, online users
- ✅ Connection status indicator
- ✅ Zoom / pan on grid
- ✅ Framer Motion animations
- ✅ Optimistic UI + server reconciliation
- ✅ Redis adapter hook for scaling

## Testing multi-user

1. Start backend + frontend.
2. Open http://localhost:5173 in two browser windows (or normal + incognito).
3. Join with different nicknames.
4. Click the same cell at the same time — one owner wins; both grids converge.
5. Watch leaderboard and activity feed update live.

## License

MIT — built as a portfolio / interview demonstration project.
