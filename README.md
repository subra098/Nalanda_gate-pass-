# Pass Flow – Digital Gatepass System

Pass Flow is a role-based web application for managing hostel gatepass workflows. Students can request gatepasses, hostel attendants and superintendents can review and approve them, and security guards can validate QR codes at the gate. The project delivers a modern, mobile-friendly experience that mirrors a native application.

## Features

- **Student Dashboard**
  - Submit new gatepass requests with destination, reason, and expected return time.
  - Track request status, view generated QR codes, and request extensions when overdue.
  - Visualise personal pass history with distribution and monthly charts.

- **Hostel Attendant Dashboard**
  - Review pending passes for the assigned hostel.
  - Approve or reject requests, including automated approval for predefined destinations.
  - Monitor daily approvals and destination trends.

- **Superintendent Dashboard**
  - Final approval stage with QR code generation.
  - Manage time extension requests and analyse weekly approval trends.

- **Security Dashboard**
  - Scan QR codes to register entries and exits in real time.
  - View recent activity with student name, registration number, and pass details.
  - Analyse hourly gate activity and entry/exit distribution.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, ShadCN UI components, lucide-react icons, Framer Motion
- **State & Data:** TanStack Query, Supabase (authentication, database, storage)
- **Charts:** Recharts
- **Utilities:** date-fns, class-variance-authority, tailwind-merge

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm (alternatively, use any Node package manager compatible with the included `package-lock.json`)

### Installation

```bash
git clone <repository-url>
cd pass-flow
npm install
```

### Environment Variables

Create a `.env` file in the project root (or configure environment variables via your hosting provider) with the following values:

```bash
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-public-key>
```

These values are used by the Supabase client located at `src/integrations/supabase/client.ts` and must correspond to your Supabase project.

### Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Produce a production build
npm run build:dev # Build using the development mode configuration
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint over the codebase
```

### Project Structure

```
src/
├─ components/        # Shared UI pieces and role-specific dashboards
├─ hooks/             # Custom hooks (authentication, etc.)
├─ integrations/      # Supabase client and generated types
├─ pages/             # Route-level components (Index, Auth, Dashboard, 404)
└─ components/ui/     # ShadCN UI primitives
```

Supabase database types are generated into `src/integrations/supabase/types.ts` and consumed by the typed client in `client.ts`.

## Development Guidelines

- **Styling:** Follows Tailwind CSS utility classes with design tokens defined in `tailwind.config.ts`. When adding components, match the existing neutral palette and rounded card aesthetic.
- **Data Fetching:** Uses TanStack Query for caching and Supabase for persistence. Prefer existing hooks or create new query keys when expanding data access.
- **Authentication:** Managed by `useAuth`, which wraps Supabase auth events. Ensure new pages consider loading and role checks provided by this hook.
- **Charts & Analytics:** Recharts is used throughout dashboards; reuse helper patterns from existing charts for consistency.

## Testing & Quality

- Run `npm run lint` before committing to catch obvious issues.
- Consider adding component or integration tests when modifying core workflows (no tests are currently included).

## Deployment

- The project is Vite-based and produces static assets via `npm run build`.
- Ensure environment variables are configured in the hosting provider (URL/key for Supabase).

## Contributing

1. Fork and clone the repository.
2. Create a feature branch (`git checkout -b feature/name`).
3. Make your changes and add tests or storybook snippets when applicable.
4. Run `npm run lint` and `npm run build` to verify.
5. Commit using clear messages and open a pull request with screenshots for UI updates.

## License

This project is currently provided without an explicit license. If you plan to reuse or distribute the code, please discuss licensing terms with the maintainers.

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

