# Deploying to Render

Complete guide for deploying the MVP Lease Abstractor to Render.

## Prerequisites

- GitHub account with your code pushed
- Render account (free tier available at https://render.com)
- OpenAI API key
- Anthropic API key (optional)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

This method uses the `render.yaml` file to automatically configure all services.

#### 1. Push Code to GitHub

```bash
cd /Users/asexton/Documents/Claude/mvp-lease-abstractor/app
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### 2. Connect to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the `mvp-lease-abstractor` repository
5. Render will detect `render.yaml` automatically

#### 3. Configure Environment Variables

Render will prompt for these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Optional, for Claude fallback |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.onrender.com` | Will be provided after creation |

#### 4. Deploy

1. Click **"Apply"**
2. Render will:
   - Create PostgreSQL database
   - Create web service
   - Attach persistent disk for file uploads
   - Run migrations
   - Deploy your app

This takes about 5-10 minutes for first deployment.

---

### Option 2: Manual Setup

If you prefer manual configuration:

#### Step 1: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `lease-abstractor-db`
   - **Database**: `lease_abstractor`
   - **Region**: Choose closest to you
   - **Plan**: Free or Starter
3. Click **"Create Database"**
4. Copy the **Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

   **Basic Settings:**
   - **Name**: `lease-abstractor`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `app` (if in subdirectory) or leave blank
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```

   **Environment Variables:**
   Add these in the "Environment" tab:

   | Key | Value |
   |-----|-------|
   | `NODE_VERSION` | `18.17.0` |
   | `DATABASE_URL` | [Internal Database URL from Step 1] |
   | `OPENAI_API_KEY` | [Your OpenAI API key] |
   | `ANTHROPIC_API_KEY` | [Your Anthropic API key] |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app-name.onrender.com` |

4. Click **"Create Web Service"**

#### Step 3: Add Persistent Disk

1. In your web service dashboard, go to **"Disks"**
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `lease-uploads`
   - **Mount Path**: `/opt/render/project/src/uploads`
   - **Size**: `10 GB` (adjust as needed)
4. Click **"Save"**

#### Step 4: Run Database Migrations

After first deployment, open the **Shell** tab in your web service and run:

```bash
npx prisma migrate deploy
```

---

## Configuration Details

### Database URL Format

Render provides two connection strings:

1. **Internal Database URL** (use this):
   ```
   postgresql://user:password@host/database
   ```

2. **External Database URL** (don't use):
   ```
   postgres://user:password@external-host/database
   ```

Always use the **Internal** URL for better performance and security.

### Environment Variables

#### Required

- `DATABASE_URL` - PostgreSQL connection string from Render
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys

#### Optional

- `ANTHROPIC_API_KEY` - Backup extraction with Claude
- `NEXT_PUBLIC_APP_URL` - Your app's public URL

### File Storage

The persistent disk at `/opt/render/project/src/uploads`:
- Stores uploaded PDF files
- Persists across deployments
- 10 GB default (can be increased)
- Free tier includes 1 GB, paid plans get more

**Important:** Free tier disk is not included. You need at least Starter plan ($7/month) for persistent storage.

### Alternative: Use Cloud Storage

For better scalability, consider using cloud storage instead of local disk:

**AWS S3:**
```typescript
// Update src/app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

**Cloudflare R2** (S3-compatible, cheaper):
```typescript
// Same as S3 but different endpoint
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

## Deployment Plans & Pricing

### Free Tier

- **Web Service**: Free for 750 hours/month
- **PostgreSQL**: Free (limited to 1 GB)
- **Limitations**:
  - App spins down after 15 minutes of inactivity
  - Cold start takes 30-60 seconds
  - No persistent disk storage
  - 100 GB bandwidth/month

**Best for:** Development, testing, low-traffic demos

### Starter Plan ($7-$25/month)

- **Web Service**: $7/month
- **PostgreSQL**: $7/month
- **Persistent Disk**: Included (10 GB)
- **Benefits**:
  - Always on (no spin down)
  - Better performance
  - More resources

**Best for:** Production, small teams, moderate traffic

### Pro Plan ($25-$85/month)

- Increased resources
- Priority support
- Advanced features

**Best for:** High traffic, enterprise use

---

## Post-Deployment

### 1. Verify Deployment

After deployment completes:

1. Visit your app URL: `https://your-app-name.onrender.com`
2. Upload a test PDF
3. Check that extraction works
4. Verify database is saving data

### 2. Update NEXT_PUBLIC_APP_URL

If you used a placeholder:

1. Copy your actual Render URL
2. Update environment variable
3. Redeploy (automatic if using render.yaml)

### 3. Set Up Custom Domain (Optional)

1. In web service settings, go to **"Custom Domain"**
2. Add your domain: `leases.yourdomain.com`
3. Configure DNS:
   - **Type**: `CNAME`
   - **Name**: `leases` (or subdomain)
   - **Value**: `your-app-name.onrender.com`
4. Wait for DNS propagation (5-60 minutes)

### 4. Enable Auto-Deploy

Render can automatically deploy when you push to GitHub:

1. Go to web service **"Settings"**
2. Enable **"Auto-Deploy"**
3. Choose branch: `main`

Now every `git push` triggers a new deployment.

---

## Database Management

### Access Database

**Via Render Dashboard:**
1. Go to your PostgreSQL service
2. Click **"Connect"**
3. Use provided credentials

**Via Prisma Studio (Local):**
```bash
# Set DATABASE_URL to Render's External URL
DATABASE_URL="postgres://..." npx prisma studio
```

### Backup Database

Render automatically backs up your database daily (Starter plan and above).

**Manual Backup:**
1. In PostgreSQL dashboard, click **"Backups"**
2. Click **"Create Backup"**
3. Download when ready

### Restore Database

1. Go to **"Backups"**
2. Select backup
3. Click **"Restore"**

---

## Monitoring & Logs

### View Logs

1. Go to web service dashboard
2. Click **"Logs"** tab
3. View real-time logs

Filter by:
- Build logs
- Deploy logs
- Runtime logs

### Monitor Performance

1. **Metrics** tab shows:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

2. **Events** tab shows:
   - Deployments
   - Restarts
   - Crashes

### Set Up Alerts

1. Go to **"Settings"** → **"Notifications"**
2. Add email or Slack webhook
3. Choose events:
   - Deploy success/failure
   - Service health
   - Resource usage

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'prisma'"**
```bash
# Solution: Ensure prisma is in dependencies, not devDependencies
npm install prisma --save
```

**Error: "Module not found: pdf-parse"**
- Already handled by `next.config.ts` externals
- Ensure config is being read

### Runtime Errors

**Error: "PrismaClient is unable to connect"**
- Check DATABASE_URL is set
- Use Internal Database URL, not External
- Verify database is running

**Error: "OpenAI API key invalid"**
- Check OPENAI_API_KEY is set correctly
- Verify key is active at https://platform.openai.com

### Cold Starts (Free Tier)

Free tier services spin down after 15 minutes of inactivity:
- First request takes 30-60 seconds
- Upgrade to Starter plan for always-on

### Out of Memory

If app crashes with OOM:
1. Upgrade to larger instance
2. Or optimize code (reduce bundle size)

---

## Scaling

### Horizontal Scaling

Render supports multiple instances:

1. Go to **"Settings"** → **"Scaling"**
2. Increase instance count
3. Render load balances automatically

**Cost:** Each instance is billed separately

### Vertical Scaling

Upgrade instance resources:

1. Go to **"Settings"** → **"Instance Type"**
2. Choose larger instance
3. Save and redeploy

**Options:**
- Starter: 512 MB RAM
- Standard: 2 GB RAM
- Pro: 4-16 GB RAM

### Database Scaling

1. Go to PostgreSQL dashboard
2. Click **"Settings"** → **"Plan"**
3. Upgrade plan for more storage/connections

---

## CI/CD Pipeline

### Automatic Deployments

Already enabled if using Blueprint or Auto-Deploy.

### Manual Deployment

1. In web service, click **"Manual Deploy"**
2. Choose branch
3. Click **"Deploy"**

### Rollback

If deployment fails:

1. Go to **"Events"** tab
2. Find previous successful deploy
3. Click **"Restore"**

---

## Security Best Practices

### Environment Variables

- Never commit `.env.local` to git
- Use Render's environment variables
- Rotate API keys regularly

### Database Access

- Use Internal Database URL for web service
- Only expose External URL if needed for migrations
- Enable connection pooling (built into Prisma)

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, number[]>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const requests = rateLimit.get(ip) ?? [];
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## Cost Optimization

### Tips to Reduce Costs

1. **Use Free PostgreSQL**: Sufficient for development
2. **Cloud Storage**: S3/R2 cheaper than persistent disk for large files
3. **Optimize Images**: Reduce bandwidth usage
4. **Cache**: Use Redis for frequently accessed data
5. **Monitor Usage**: Check metrics to avoid over-provisioning

### Estimated Monthly Costs

**Minimal Production Setup:**
- Web Service (Starter): $7
- PostgreSQL (Starter): $7
- Persistent Disk (10 GB): Included
- **Total: $14/month**

**Recommended Production:**
- Web Service (Standard): $25
- PostgreSQL (Standard): $25
- Persistent Disk (50 GB): $5
- **Total: $55/month**

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com
- **Support**: support@render.com (paid plans)

---

## Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Test PDF upload and extraction
- [ ] Verify data persists after redeploy
- [ ] Set up monitoring and alerts
- [ ] Configure backups
- [ ] Review security settings
- [ ] Test on mobile devices
- [ ] Document your deployment for team

---

**Deployment complete! 🚀**

Your lease abstraction app is now live on Render.
