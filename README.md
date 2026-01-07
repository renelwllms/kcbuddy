# KCBuddy

KCBuddy is a multi-family chore, rewards, and savings goal tracker with a public marketing site and a mobile-first web app.

## Structure
- `client/` React app (marketing site at `/`, app at `/app`)
- `server/` Express API + static hosting of the built client

## Quick start (dev)
1. Create the database and apply `server/schema.sql`.
2. Copy `server/.env.example` to `server/.env` and fill values.
3. Install dependencies:
   - `cd client && npm install`
   - `cd server && npm install`
4. Run dev servers:
   - `npm run dev` in `client/`
   - `npm run dev` in `server/`

## Production build
1. Build the client: `cd client && npm run build`
2. Start the API/server: `cd server && npm run start`

## Notes
- The marketing About/Contact content should be sourced from edgepoint.co.nz and inserted into `client/src/pages/About.jsx` and `client/src/pages/Contact.jsx`.
- Photo uploads are stored locally in `server/uploads` and served from `/uploads`. Files older than 7 days are cleaned up automatically.
