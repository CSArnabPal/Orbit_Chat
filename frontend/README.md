# Orbit Chat frontend

The frontend is a React 19 single-page app built with Vite. Its screens are:

- **Home:** choose a display name and room, revisit recently used rooms, or join an existing room.
- **Chat:** read live room messages and history, search messages, copy an invite link, and compose messages with Enter (Shift+Enter inserts a newline).

Display names and up to five recent rooms are saved in the browser's local storage. No account is required.

## Development

Use Node.js 20.19+ or 22.12+. From `frontend/`:

```sh
npm install
npm run dev
```

The API and WebSocket backend default to port `8000` on the current hostname. To use a different backend, set `VITE_API_BASE_URL` before starting Vite or building:

```sh
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

In PowerShell, set the variable with `$env:VITE_API_BASE_URL = "http://localhost:8000"` before running the npm command. The backend must allow the frontend's origin; see [backend/README.md](../backend/README.md).

## Scripts

```sh
npm run dev      # Start the Vite development server
npm run lint     # Run ESLint
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build
```
