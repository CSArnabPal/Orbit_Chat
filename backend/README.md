# Orbit Chat backend

The backend is a Django REST Framework and Django Channels application. SQLite stores rooms and messages; Redis backs the Channels layer so messages can be broadcast to everyone in a room.

## Requirements

- Python 3.12 or newer
- Redis 6 or newer, running locally or reachable through `REDIS_URL`

## Set up

From the repository root:

```sh
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
```

On Windows, activate the environment with `.venv\Scripts\activate`.

Start Redis using your operating system's service manager, or run `redis-server` if it is installed and available on your `PATH`. In another terminal, start the ASGI server from the `backend` directory:

```sh
daphne -b 0.0.0.0 -p 8000 chatbackend.asgi:application
```

On Windows, use `.venv\Scripts\daphne.exe` instead.

The REST API is served under `/api/`:

- `GET /api/rooms/` lists rooms.
- `POST /api/rooms/` creates a room.
- `GET /api/rooms/<room-name>/messages/` lists that room's messages.
- `POST /api/rooms/<room-name>/messages/` creates a message in that room. Send JSON with `username` and `content`.

WebSocket clients connect to `/ws/chat/<room-name>/` and send JSON with `username` and `message`. Names are limited to 80 characters and messages to 2,000 characters.

Rooms are currently public and chat has no account authentication, authorization, or rate limiting. Do not send sensitive information through it. Before exposing this app to the public internet, add an authentication and abuse-prevention policy appropriate to your use case.

## Configuration

All settings are optional for local development:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DJANGO_DEBUG` | `true` | Django debug mode; use `false` outside local development. |
| `DJANGO_SECRET_KEY` | Local-only development key | Set a unique secret before running with debug disabled. |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated Django host names. |
| `DJANGO_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated frontend origins allowed to call the API. |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL for Channels. |

For example, set `DJANGO_DEBUG=false`, `DJANGO_SECRET_KEY` to a secure, unique value, and configure the production host and frontend origins before deployment. WebSocket origins are also checked against `DJANGO_ALLOWED_HOSTS`.

## Checks and tests

Run these commands from `backend/`:

```sh
python manage.py check
python manage.py test chat
```
