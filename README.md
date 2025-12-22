# Pass Flow – Digital Gatepass System

Pass Flow is a modern, role-based web application designed to streamline hostel gatepass workflows. It enables students to request gatepasses, hostel attendants and superintendents to review and approve them, and security guards to validate QR codes at the gate. The application delivers a mobile-friendly experience that feels like a native app, ensuring efficient and secure gatepass management.

## Features

### Student Dashboard
- **Request Gatepasses**: Submit new requests with destination, reason, and expected return time.
- **Track Status**: Monitor request status, view generated QR codes, and request extensions for overdue passes.
- **Pass History**: Visualize personal pass history with distribution and monthly charts.

### Hostel Attendant Dashboard
- **Review Requests**: Examine pending passes for the assigned hostel.
- **Approve/Reject**: Approve or reject requests, with automated approval for predefined destinations.
- **Analytics**: Monitor daily approvals and destination trends.

### Superintendent Dashboard
- **Final Approval**: Provide final approval and generate QR codes.
- **Extension Management**: Handle time extension requests.
- **Trends Analysis**: Analyze weekly approval trends.

### Security Dashboard
- **QR Scanning**: Scan QR codes to log entries and exits in real time.
- **Activity Monitoring**: View recent activity with student details.
- **Analytics**: Analyze hourly gate activity and entry/exit distributions.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, ShadCN UI components, Lucide React icons, Framer Motion
- **State Management & Data**: TanStack Query, Supabase (authentication, database, storage)
- **Charts**: Recharts
- **Utilities**: date-fns, class-variance-authority, tailwind-merge

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm (or any compatible package manager like yarn or pnpm)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nit-gate-pass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the project root with the following variables:
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-public-key>
```
These are required for Supabase integration.

### Available Scripts
- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run build:dev`: Build in development mode
- `npm run preview`: Preview the production build
- `npm run lint`: Run ESLint

## Project Structure
```
src/
├── components/          # Shared UI components and role-specific dashboards
├── hooks/               # Custom hooks (authentication, mobile detection, etc.)
├── integrations/        # Supabase client and types
├── pages/               # Route-level components (Auth, Dashboard, etc.)
├── lib/                 # Utility functions
└── components/ui/       # ShadCN UI primitives
supabase/
├── config.toml          # Supabase configuration
└── migrations/          # Database migrations
```

## Development Guidelines

- **Styling**: Use Tailwind CSS utility classes with design tokens from `tailwind.config.ts`. Maintain a neutral palette and rounded card aesthetic.
- **Data Fetching**: Utilize TanStack Query for caching and Supabase for persistence. Create new query keys for expanded data access.
- **Authentication**: Managed via `useAuth` hook wrapping Supabase auth events. Ensure new pages handle loading and role checks.
- **Charts**: Use Recharts consistently across dashboards, following existing patterns.

## Testing & Quality
- Run `npm run lint` before committing to catch issues.
- Consider adding tests for core workflows (currently no tests are included).

## Deployment
- Build static assets with `npm run build`.
- Configure environment variables in your hosting provider.
- Deploy to platforms like Vercel, Netlify, or any static hosting service.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/name`).
3. Make changes and run `npm run lint` and `npm run build`.
4. Commit with clear messages and open a pull request with screenshots for UI changes.

## License
This project is provided without an explicit license. Contact maintainers for reuse or distribution terms.

## Screenshots
(Add screenshots here if available, e.g., dashboard views, QR scanning interface)

## Support
For questions or issues, please open an issue in the repository.
