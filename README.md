# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## LinkUp Backend (Express + Prisma)

This repository now includes a backend API for LinkUp collaborative scheduling.

### Backend stack

- Node.js + TypeScript
- Express
- PostgreSQL (Supabase compatible)
- Prisma ORM
- Zod
- Day.js

### Environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/linkup
PORT=4000
APP_BASE_URL=http://localhost:4000
OWNER_KEY_SALT=change_me
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

### Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Run backend

```bash
npm run dev:server
```

Health check:

```bash
curl http://localhost:4000/health
```

### API base

`/api/plans`

### Endpoints

1. `POST /api/plans`
2. `POST /api/plans/:token/join`
3. `POST /api/plans/:token/availability`
4. `GET /api/plans/:token/state?viewerName=...`
5. `POST /api/plans/:token/finalize` (requires `x-owner-key`)

### Example cURL

Create plan:

```bash
curl -X POST http://localhost:4000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Weekend Hangout",
    "ownerName":"Arjun",
    "dateStart":"2026-02-21",
    "dateEnd":"2026-02-21",
    "timeStart":"16:00",
    "timeEnd":"23:00",
    "durationMinutes":120
  }'
```

Join plan:

```bash
curl -X POST http://localhost:4000/api/plans/Ab3K9xL2/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya"}'
```

Submit availability:

```bash
curl -X POST http://localhost:4000/api/plans/Ab3K9xL2/availability \
  -H "Content-Type: application/json" \
  -d '{
    "participantId":"00000000-0000-0000-0000-000000000000",
    "timestamps":["2026-02-21T18:00:00.000Z","2026-02-21T18:15:00.000Z"]
  }'
```

Get state (poll every 5 seconds):

```bash
curl "http://localhost:4000/api/plans/Ab3K9xL2/state?viewerName=Arjun"
```

Finalize:

```bash
curl -X POST http://localhost:4000/api/plans/Ab3K9xL2/finalize \
  -H "x-owner-key: OWNER_KEY_FROM_CREATE_PLAN"
```

### Notes

- Time is handled in UTC end-to-end.
- Slots are discrete 15-minute timestamps.
- Availability updates replace previous selections atomically.
- State responses are cached in memory for 3 seconds to reduce recomputation during 5s polling.
- The owner key acts as lightweight authorization; keep it private.
- For Supabase, use the standard Postgres connection string in `DATABASE_URL`.
