# BaZi Life Analysis MVP

A minimal web application for BaZi (Chinese astrology) life analysis with an admin panel for editing and publishing reports.

## Features

- **Calculator Page** (`/calc`): User-facing form to input birth details (date, time, gender, location)
- **Mock Analysis**: Generates basic BaZi summary with random elements
- **Draft Reports**: Automatically creates draft reports in database
- **Admin Panel** (`/admin/reports/[id]`): Password-protected editor to refine and publish reports
- **Clean UI**: Apple-inspired minimal design with low-saturation palette

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Database**: SQLite with Prisma ORM
- **State**: React hooks

## Prerequisites

- Node.js 18+ and npm
- Git (for cloning)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already created with default values:

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin123"
```

You can modify the admin password as needed.

### 3. Database Setup (REQUIRED)

⚠️ **This step is required before running the app!**

Generate Prisma client and create the database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates dev.db)
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

**Troubleshooting**: If you encounter errors:
- Try prefixing commands with `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help
- Make sure the `prisma/dev.db` file exists after running `db:push`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Report

1. Visit `/calc` or click "Get Started" from the home page
2. Fill in birth details:
   - Birth Date
   - Birth Time
   - Gender
   - Birth Location
3. Click "Calculate BaZi"
4. A draft report is created and an alert shows the admin link

### Editing in Admin

1. Visit `/admin/reports/[id]` (use the ID from the alert or database)
2. Enter password (default: `admin123`)
3. Edit the report:
   - Title
   - Basic Summary
   - Full Content (supports Markdown)
4. Click "Save Changes" to save as draft
5. Click "Publish Report" to mark as published

## Database Schema

```prisma
model Report {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  status       String   @default("draft")
  title        String
  basicSummary String   @default("")
  fullContent  String   @default("")
  publishAt    DateTime?
  formJson     String   @default("{}")
}
```

## API Routes

- **POST /api/reports** - Create a new report
- **GET /api/reports** - Get all reports
- **GET /api/reports/[id]** - Get a specific report
- **PUT /api/reports/[id]** - Update a report

## Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:push` - Push schema to database (faster, no migrations)
- `npm run db:seed` - Seed database with sample data
- `npm run prisma:generate` - Generate Prisma Client

## Project Structure

```
bazi-life-mvp/
├── app/
│   ├── admin/reports/[id]/page.tsx    # Admin editor
│   ├── api/reports/                   # API routes
│   ├── calc/page.tsx                  # Calculator form
│   ├── globals.css                    # Global styles
│   └── page.tsx                       # Home page
├── lib/
│   └── prisma.ts                      # Prisma client
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Seed script
└── .env                               # Environment variables
```

## Security Notes

⚠️ **This is an MVP**. For production:

1. Replace simple password check with proper authentication (NextAuth, JWT, etc.)
2. Use server-side API routes for password verification
3. Add CSRF protection
4. Validate and sanitize all inputs
5. Use environment variables for secrets
6. Add rate limiting
7. Use HTTPS

## License

MIT
