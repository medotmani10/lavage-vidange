# Deployment Guide - Lavage & Vidange ERP 2026

## Overview

This guide covers deployment options for the Lavage & Vidange ERP system, including production build, hosting options, and environment configuration.

## Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Domain name (optional)
- Hosting account (Vercel, Netlify, or similar)

## Production Build

### 1. Build the Application

```bash
# Install dependencies
npm install

# Run tests
npm run test:run

# Build for production
npm run build
```

The build output will be in the `dist/` folder.

### 2. Verify Build

```bash
# Preview production build locally
npm run preview
```

This starts a local server at `http://localhost:4173` to test the production build.

## Environment Variables

### Production .env

Create a `.env.production` file or configure environment variables in your hosting platform:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Settings
VITE_APP_NAME=Lavage & Vidange ERP
VITE_DEFAULT_LANGUAGE=fr
VITE_SUPPORTED_LANGUAGES=fr,ar

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

**Important:** Never commit `.env` files to version control!

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers excellent support for React/Vite applications with automatic deployments.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - Go to your project dashboard on Vercel
   - Navigate to Settings → Environment Variables
   - Add all required variables from `.env.example`

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration (vercel.json)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

Netlify provides easy deployment with continuous integration.

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

#### Netlify Configuration (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: Manual Deployment (VPS/Dedicated Server)

For full control, deploy to a VPS like DigitalOcean, Linode, or AWS.

#### Steps:

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to server**
   ```bash
   scp -r dist/* user@your-server:/var/www/lavage-vida/
   ```

3. **Configure Nginx**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/lavage-vida;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **Setup SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 4: Docker Deployment

Containerize the application for consistent deployments.

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t lavage-vida-erp .

# Run container
docker run -p 80:80 lavage-vida-erp
```

#### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS policies set correctly
- [ ] Environment variables secured
- [ ] Supabase RLS policies active

### Performance
- [ ] Gzip/Brotli compression enabled
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Lighthouse score > 90

### Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Uptime monitoring enabled
- [ ] Log aggregation setup

### Backup
- [ ] Database backups configured (Supabase automatic)
- [ ] Environment variables backed up securely
- [ ] Deployment rollback procedure documented

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: test-and-build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Netlify
```bash
# List deploys
netlify api listSiteDeploys --siteId [site-id]

# Rollback
netlify api rollbackSiteDeploy --siteId [site-id] --deployId [deploy-id]
```

### Manual
```bash
# Keep previous build folder
cp -r dist dist-backup

# Rollback
rm -rf dist
mv dist-backup dist
```

## Monitoring & Logs

### Supabase Logs
- Dashboard → Logs
- Filter by table, function, or error

### Vercel Logs
- Dashboard → Project → Deployments → View logs
- CLI: `vercel logs [deployment-url]`

### Application Errors
Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Plausible**: Privacy-friendly analytics

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});
```

### Lazy Loading
```typescript
// In App.tsx
const Finance = lazy(() => import('./pages/Finance'));

// Wrap routes with Suspense
<Suspense fallback={<Loading />}>
  <Route path="/finance" element={<Finance />} />
</Suspense>
```

## Support & Troubleshooting

### Common Issues

1. **White screen after deployment**
   - Check browser console for errors
   - Verify environment variables
   - Check base path configuration

2. **404 on page refresh**
   - Ensure redirect rules are configured
   - Check server configuration

3. **API calls failing**
   - Verify Supabase URL and keys
   - Check CORS settings
   - Verify RLS policies

### Getting Help

- Documentation: `/DATABASE_SETUP.md`, `/AUTH_SETUP.md`
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

## Maintenance

### Regular Updates
```bash
# Update dependencies monthly
npm update

# Check for outdated packages
npm outdated

# Security updates
npm audit fix
```

### Database Maintenance
- Run `ANALYZE` on tables monthly
- Review and clean old data
- Monitor query performance

### Backup Schedule
- Database: Daily (Supabase automatic)
- Environment variables: On change
- Configuration files: On change

---

**Deployment Complete!** 🎉

Your Lavage & Vidange ERP is now live and ready for production use.
