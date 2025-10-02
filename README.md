# Tydal Lease Abstracts MVP

AI-powered commercial lease abstraction application. Upload lease documents (PDF/DOCX), extract structured data using Claude AI, review and edit extracted fields, and export to PDF or ICS calendar files.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude API for extraction
- **PDF Generation**: Puppeteer
- **Calendar**: ICS file generation

## Features

✅ Drag-and-drop file upload (PDF/DOCX)
✅ AI-powered lease data extraction
✅ Review and edit extracted fields
✅ Professional PDF abstract export
✅ ICS calendar file downloads for critical dates
✅ Lease management dashboard

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Docker (optional, for local PostgreSQL)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: Using Docker**
```bash
docker compose up -d
```

**Option B: Using local PostgreSQL**
Install PostgreSQL and create a database:
```bash
createdb lease_abstracts
```

**Option C: Using hosted PostgreSQL**
Use [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/)

### 3. Configure Environment Variables

Update `.env.local` with your credentials:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lease_abstracts?schema=public"
ANTHROPIC_API_KEY="sk-ant-xxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage with upload
│   │   ├── leases/
│   │   │   ├── page.tsx       # Leases list
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Lease detail (server)
│   │   │       └── client.tsx # Review form (client)
│   │   └── api/
│   │       ├── upload/route.ts          # File upload + extraction
│   │       └── leases/[id]/
│   │           ├── route.ts             # Update lease
│   │           ├── pdf/route.ts         # PDF export
│   │           └── dates/[dateId]/ics/route.ts  # ICS download
│   ├── components/
│   │   ├── ui/                # Shadcn components
│   │   └── upload-form.tsx    # File upload widget
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── types.ts           # LeaseAbstract type
│       ├── extractor.ts       # Claude AI extraction
│       ├── pdf-generator.ts   # PDF rendering
│       └── ics-generator.ts   # Calendar file creation
└── uploads/                   # Uploaded files storage
```

## Usage Workflow

1. **Upload**: Drag and drop a lease PDF/DOCX document
2. **Wait**: AI extracts structured data (takes 15-30 seconds)
3. **Review**: View extracted fields in editable form
4. **Edit**: Correct any errors or missing information
5. **Save**: Click "Save Changes" to persist edits
6. **Export**:
   - Download PDF abstract
   - Download ICS files for critical dates

## API Endpoints

- `POST /api/upload` - Upload file and trigger extraction
- `PATCH /api/leases/:id` - Update extracted data
- `GET /api/leases/:id/pdf` - Download PDF abstract
- `GET /api/leases/:id/dates/:dateId/ics` - Download ICS file

## Development

### Database Changes

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### View Database

```bash
npx prisma studio
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (use Neon or Supabase)
   - `ANTHROPIC_API_KEY`
4. Deploy

**Note**: Puppeteer may require additional configuration on Vercel. Consider using `@sparticuz/chromium` for serverless environments.

## Troubleshooting

### "Module not found: Can't resolve '@prisma/client'"

Run: `npx prisma generate`

### "Error: P1001: Can't reach database server"

Check your `DATABASE_URL` is correct and database is running.

### Puppeteer fails in production

Install Chrome for serverless:
```bash
npm install @sparticuz/chromium
```

Update `pdf-generator.ts` to use the serverless Chromium binary.

## License

MIT
