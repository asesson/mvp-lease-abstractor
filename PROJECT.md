# MVP Lease Abstractor

AI-powered commercial lease abstraction system that extracts structured data from lease PDFs using OpenAI GPT-4o.

## Overview

This application automates the process of extracting key information from commercial lease agreements. It handles both text-based and scanned/image-based PDFs, providing a structured, editable interface for lease data.

## Features

### Core Functionality
- **PDF Upload & Processing**: Drag-and-drop interface for uploading lease PDFs
- **AI Extraction**: Uses OpenAI GPT-4o Assistants API to extract structured data
- **Dual PDF Support**: Handles both text-based and image-based/scanned PDFs
- **Editable Interface**: Full CRUD operations for reviewing and editing extracted data
- **Data Persistence**: PostgreSQL database with Prisma ORM (hosted on Neon)

### Extracted Data Points
- **Parties**: Tenant, Landlord, Guarantor
- **Property**: Address, Square Footage, Building Details
- **Lease Term**: Commencement, Expiration, Length, Renewal Options
- **Economics**: Security Deposit, Base Rent Schedule with $/SF rates
- **Rights**: Expansion, Termination options
- **Services**: Permitted Use, Utilities
- **Legal**: Environmental obligations, Maintenance responsibilities
- **Parking & Signage**: Details and restrictions
- **Critical Dates**: With calendar export (.ics)

### Technical Features
- Real-time processing status updates
- Decimal formatting for financial data (2 decimal places)
- Calendar export for critical dates
- PDF download of original documents
- Delete functionality with confirmation
- Responsive design for desktop and mobile

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Backend
- **API Routes**: Next.js API Routes
- **Database**: PostgreSQL (Neon cloud)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4o with Assistants API
- **PDF Processing**: pdf2json

### Infrastructure
- **Deployment**: Ready for Vercel
- **File Storage**: Local filesystem (uploads/ directory)
- **Environment**: .env.local for configuration

## Project Structure

```
app/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/         # PDF upload and extraction
│   │   │   └── leases/         # CRUD operations
│   │   ├── leases/
│   │   │   ├── page.tsx        # Lease list
│   │   │   ├── client.tsx      # Lease list client component
│   │   │   └── [id]/           # Lease detail pages
│   │   ├── page.tsx            # Home page with upload
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── upload-form.tsx     # File upload component
│   └── lib/
│       ├── extractor-openai.ts # OpenAI extraction logic
│       ├── extractor.ts        # Claude extraction (backup)
│       ├── types.ts            # TypeScript types
│       ├── db.ts               # Prisma client
│       ├── ics-generator.ts    # Calendar export
│       └── pdf-generator.ts    # PDF generation
├── uploads/                    # Uploaded PDF storage
├── .env.local                  # Environment variables
├── package.json                # Dependencies
└── next.config.ts              # Next.js configuration
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- OpenAI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mvp-lease-abstractor.git
   cd mvp-lease-abstractor/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://..."
   OPENAI_API_KEY="sk-..."
   ANTHROPIC_API_KEY="sk-ant-..." # Optional, for Claude fallback
   NEXT_PUBLIC_APP_URL="http://localhost:3002"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Create uploads directory:**
   ```bash
   mkdir -p uploads
   ```

6. **Start development server:**
   ```bash
   npm run dev -- -p 3002
   ```

7. **Open browser:**
   Navigate to http://localhost:3002

## Database Schema

### Lease Model
```prisma
model Lease {
  id            String   @id @default(uuid())
  filename      String
  fileSize      Int
  filePath      String
  status        String   @default("processing")
  errorMessage  String?
  extractedData Json?
  uploadedAt    DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## API Endpoints

### Upload & Extract
- **POST** `/api/upload`
  - Uploads PDF and initiates extraction
  - Returns lease ID and status

### Lease Operations
- **GET** `/api/leases/:id` - Get lease details
- **PATCH** `/api/leases/:id` - Update extracted data
- **DELETE** `/api/leases/:id` - Delete lease

### File Operations
- **GET** `/api/leases/:id/pdf` - Download original PDF
- **GET** `/api/leases/:id/dates/:dateId/ics` - Download calendar event

## AI Extraction Process

1. **File Upload**: PDF uploaded to server
2. **OpenAI Upload**: PDF sent to OpenAI Files API
3. **Assistant Creation**: GPT-4o assistant created with JSON response format
4. **Thread & Run**: Message thread created with PDF attachment
5. **Extraction**: Assistant processes PDF and returns structured JSON
6. **Validation**: Response validated against TypeScript schema
7. **Storage**: Data saved to PostgreSQL database
8. **Cleanup**: OpenAI resources (assistant, thread, file) deleted

### Handling Different PDF Types
- **Text-based PDFs**: Direct text extraction via OpenAI
- **Scanned/Image PDFs**: OCR performed automatically by GPT-4o Vision
- **Fallback**: pdf2json used for local text extraction if needed

## Configuration

### Next.js Config
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdf-parse', 'canvas');
    }
    return config;
  },
};
```

### Prisma Config
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

## Development

### Running Tests
```bash
# Currently no tests - recommended to add:
npm install --save-dev jest @testing-library/react
```

### Database Management
```bash
# View data in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset
```

### Code Quality
```bash
# Format code
npm run format

# Type check
npm run type-check
```

## Deployment

### Vercel Deployment

1. **Prepare for deployment:**
   ```bash
   # Ensure .env.local is not committed
   # Add environment variables in Vercel dashboard
   ```

2. **Deploy:**
   ```bash
   npx vercel
   ```

3. **Configure environment variables in Vercel:**
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (optional)
   - `NEXT_PUBLIC_APP_URL`

4. **File storage consideration:**
   - Current setup uses local filesystem
   - For production, consider:
     - AWS S3
     - Vercel Blob Storage
     - Cloudinary

## Performance Considerations

### Extraction Time
- Average: 20-40 seconds per document
- Depends on PDF size and complexity
- Timeout set to 2 minutes maximum

### Cost Optimization
- OpenAI API calls: ~$0.01-0.05 per document
- Consider caching extracted data
- Implement rate limiting for high-volume use

### Scalability
- Database: PostgreSQL handles millions of records
- File storage: Move to S3/Blob for production
- Consider queue system (Bull, BullMQ) for async processing

## Troubleshooting

### Common Issues

**"Module not found: pdf-parse"**
- Already handled via webpack externals in next.config.ts

**"No response from OpenAI"**
- Check API key in .env.local
- Verify OpenAI account has credits
- Check rate limits

**"Database connection failed"**
- Verify DATABASE_URL in .env.local
- Run `npx prisma migrate dev`
- Check Neon dashboard for connection issues

**"PDF extraction returns nulls"**
- PDF may be corrupted
- Try different PDF
- Check OpenAI API response in server logs

## Future Enhancements

### Planned Features
- [ ] Batch upload processing
- [ ] Export to Excel/CSV
- [ ] Comparison view for multiple leases
- [ ] Advanced search and filtering
- [ ] User authentication and multi-tenancy
- [ ] Audit trail for edits
- [ ] Email notifications
- [ ] API for third-party integrations

### Technical Improvements
- [ ] Add comprehensive test suite
- [ ] Implement caching layer (Redis)
- [ ] Add queue system for async processing
- [ ] Migrate to cloud file storage
- [ ] Add monitoring and analytics
- [ ] Implement CI/CD pipeline
- [ ] Add API rate limiting
- [ ] Optimize database queries

## Security Considerations

- API keys stored in environment variables
- File uploads validated for type and size
- SQL injection prevented via Prisma ORM
- XSS protection via React's default escaping
- Consider adding:
  - File encryption at rest
  - Authentication/authorization
  - Rate limiting
  - Input sanitization
  - CORS configuration

## License

MIT License - See LICENSE file for details

## Contributors

- Initial development by Andrew Sexton
- AI assistance by Claude Code

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Email: [your-email]

---

**Built with ❤️ using Claude Code**

Last Updated: October 2, 2025
