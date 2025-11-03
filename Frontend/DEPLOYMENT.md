# Deployment Guide

## Build Status
✅ **Production build successful** with optimized code splitting

## Build Output
- **Total bundle size**: ~1MB (compressed: ~294KB gzip)
- **Code splitting**: 5 optimized chunks
  - `react-vendor.js`: 162.92 KB (53.14 KB gzip) - React core libraries
  - `data-vendor.js`: 166.16 KB (49.88 KB gzip) - Axios, Supabase, Zustand
  - `ui-vendor.js`: 187.97 KB (59.96 KB gzip) - Framer Motion, Toast, Dropzone
  - `chart-vendor.js`: 410.87 KB (110.20 KB gzip) - Recharts
  - `index.js`: 77.91 KB (20.70 KB gzip) - Application code
- **CSS**: 23.97 KB (4.95 KB gzip)

## Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=your_backend_api_url
```

### 2. Supabase Setup
- Create a Supabase project at https://supabase.com
- Database schema is already created via migration
- Copy your project URL and anon key to `.env`
- Verify RLS policies are enabled

### 3. Backend API
Ensure your backend API has the following endpoints:
- `POST /upload/` - File upload endpoint
- `POST /process-pdf/?pdf_url=` - PDF processing endpoint
- `GET /query/?query=` - Query processing endpoint

### 4. Build Verification
```bash
npm run build
```

This should complete successfully with no errors.

## Deployment Platforms

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy
4. Add environment variables in Vercel dashboard

Or use the Vercel GitHub integration:
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

### Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`
3. For production: `netlify deploy --prod`

Or use Netlify UI:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### AWS Amplify
1. Connect GitHub repository in AWS Amplify console
2. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
   ```
3. Add environment variables

### Docker Deployment
Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t insurance-claims-app .
docker run -p 80:80 insurance-claims-app
```

## Post-Deployment

### 1. Verify Functionality
- [ ] Landing page loads correctly
- [ ] Upload page accepts PDF files
- [ ] Query page processes questions
- [ ] Documents page displays uploaded files
- [ ] Analytics page shows charts
- [ ] Navigation works across all pages
- [ ] Mobile responsive design works

### 2. Performance Optimization
- Enable gzip compression on your server
- Configure CDN for static assets
- Enable HTTP/2 or HTTP/3
- Set up proper caching headers

### 3. Monitoring
- Set up error tracking (Sentry, LogRocket)
- Configure analytics (Google Analytics, Plausible)
- Monitor performance (Lighthouse CI)
- Set up uptime monitoring

### 4. Security
- Configure CORS headers properly
- Use HTTPS only
- Set up Content Security Policy
- Enable rate limiting on API endpoints

## Environment-Specific Configurations

### Development
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.example.com
```

### Production
```env
VITE_API_BASE_URL=https://api.example.com
```

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm ci`
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node version: Should be 18+ or 20+

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase credentials are valid
- Check API endpoint connectivity

### Performance Issues
- Verify code splitting is working (check Network tab)
- Enable production mode optimizations
- Use lazy loading for routes
- Optimize images and assets

## Scaling Considerations

### Frontend
- Use CDN for static assets
- Enable edge caching
- Implement service workers for offline support
- Consider Progressive Web App (PWA) features

### Backend
- Implement API caching
- Use database connection pooling
- Set up horizontal scaling
- Monitor API rate limits

### Database
- Add indexes for frequently queried columns
- Implement query optimization
- Set up read replicas if needed
- Monitor connection limits

## Rollback Strategy

If deployment fails:
1. Keep previous version deployed
2. Use deployment platform's rollback feature
3. Or revert to previous Git commit
4. Verify rollback with smoke tests

## Continuous Deployment

Set up GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      # Add deployment step for your platform
```

## Support

For issues during deployment:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints manually
4. Check browser console for client errors
5. Review Supabase dashboard for database issues
