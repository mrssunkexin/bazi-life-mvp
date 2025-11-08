# Troubleshooting Guide

## Error: "Failed to create report"

This error usually means the database hasn't been set up yet. Follow these steps:

### Step 1: Generate Prisma Client

```bash
npm run prisma:generate
```

If this fails with a network error, try:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Step 2: Create the Database

```bash
npm run db:push
```

If this fails, try:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
```

### Step 3: Verify Database Exists

Check that `prisma/dev.db` file was created:
```bash
ls -la prisma/dev.db
```

### Step 4: Restart Dev Server

Stop the dev server (Ctrl+C) and restart:
```bash
npm run dev
```

## Common Issues

### Prisma Engine Download Fails

If you see errors about downloading Prisma engines:

1. **Network restrictions**: You may be behind a firewall
   - Try using `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` prefix
   - Or download from a different network

2. **Offline environment**:
   - Set up the project on a machine with internet access first
   - Copy the entire `node_modules` folder to your offline environment

### Database Already Exists

If you need to reset the database:

```bash
# Delete the database
rm prisma/dev.db

# Recreate it
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

### TypeScript Errors

If you see TypeScript errors about Prisma Client:

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Restart TypeScript server in your editor
# In VSCode: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Port 3000 Already in Use

If you see "Port 3000 is already in use":

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Verify Your Setup

Run this command to check if everything is working:

```bash
# Check if database exists
ls -la prisma/dev.db

# Check if Prisma client is generated
ls -la node_modules/.prisma/client/

# Try to access the database directly
npx prisma studio
```

## Still Having Issues?

1. Check the browser console (F12) for detailed error messages
2. Check the terminal where `npm run dev` is running for server-side errors
3. Make sure you're using Node.js 18 or higher: `node --version`
4. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run db:push
   npm run dev
   ```

## Quick Verification Script

Create a test file to verify the database connection:

```typescript
// test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  const count = await prisma.report.count();
  console.log(`✅ Database connected! Reports count: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Database error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it with:
```bash
npx tsx test-db.ts
```
