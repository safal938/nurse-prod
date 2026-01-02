# Vercel Deployment Guide

## Issue Fixed
The deployment was failing due to a peer dependency conflict between:
- React 19 (used by the project)
- react-quill 2.0.0 (only supports React 18)

## Solution Applied

### 1. Removed Unused Dependency
Removed `react-quill` from package.json since the project uses `quill` directly, not the React wrapper.

### 2. Added `.npmrc` Configuration
Created `.npmrc` file with:
```
legacy-peer-deps=true
```
This tells npm to use legacy peer dependency resolution, which is more lenient.

### 3. Added `vercel.json` Configuration
Created `vercel.json` with custom build command:
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Added React Type Definitions
Added to devDependencies:
- `@types/react@^19.0.6`
- `@types/react-dom@^19.0.3`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Push changes to your Git repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Environment Variables
If your app needs environment variables, add them in Vercel:
1. Go to Project Settings → Environment Variables
2. Add any required variables (e.g., API keys, backend URLs)

## Build Settings (Auto-detected)
- **Framework Preset**: Vite
- **Build Command**: `npm install --legacy-peer-deps && npm run build` (from vercel.json)
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

## Troubleshooting

### If deployment still fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are listed in package.json
3. Verify that `.npmrc` and `vercel.json` are committed to git

### Local Testing
Test the production build locally:
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Build
npm run build

# Preview
npm run preview
```

### Clear Vercel Cache
If you're still having issues:
1. Go to Vercel Dashboard → Project Settings
2. Click "Clear Cache"
3. Redeploy

## Post-Deployment Checklist
- [ ] App loads correctly
- [ ] Patient list displays
- [ ] Consultation page opens
- [ ] WebSocket connection works (check browser console)
- [ ] Voice consultation starts
- [ ] All tabs in consultation page work

## WebSocket Configuration
The app connects to:
```
wss://clinic-hepa-v2-481780815788.europe-west1.run.app
```

Ensure this backend is accessible from your Vercel deployment domain.

## Custom Domain (Optional)
To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

## Notes
- The `.npmrc` file ensures npm doesn't fail on peer dependency warnings
- The `vercel.json` rewrites ensure React Router works correctly (all routes go to index.html)
- React 19 is fully compatible with the project, the issue was only with the unused react-quill package
