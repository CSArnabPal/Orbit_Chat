# Orbit Chat

Orbit is a small, real-time chat app. People can choose a display name, join a shared room, find recent and public rooms, search room history, and share an invite link. The frontend is React and Vite; the backend is Django REST Framework and Django Channels, with SQLite for persistence and Redis for real-time message delivery.

## Run locally

You need Node.js 20.19+ or 22.12+, Python 3.12+, and Redis 6+.

1. Start Redis using your platform's service manager, or run `redis-server`.
2. In a terminal, set up and start the backend:

   ```sh
   cd backend
   python3.12 -m venv .venv
   . .venv/bin/activate
   python -m pip install -r requirements.txt
   python manage.py migrate
   daphne -b 0.0.0.0 -p 8000 chatbackend.asgi:application
   ```

3. In a second terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

For Windows, activate Python with `.venv\Scripts\activate` and run `.venv\Scripts\daphne.exe -b 0.0.0.0 -p 8000 chatbackend.asgi:application`.

## Configuration

The frontend connects to the backend at the current hostname on port `8000` by default. Set `VITE_API_BASE_URL` to the backend root URL if it is hosted elsewhere, for example `http://localhost:8000`.

The backend reads `DJANGO_DEBUG`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS`, and `REDIS_URL`. Local-development defaults are provided; deployments must set a unique secret key and configure the allowed hosts and frontend origins. See [backend/README.md](./backend/README.md) for all settings and API details.

## Checks

Run frontend checks from `frontend/`:

```sh
npm run lint
npm run build
```

Run backend checks from `backend/`:

```sh
python manage.py check
python manage.py test chat
```

## Project guides

- [Backend setup, configuration, and API](./backend/README.md)
- [Frontend development and features](./frontend/README.md)
