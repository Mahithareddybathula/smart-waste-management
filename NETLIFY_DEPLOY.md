# Netlify Deployment Guide

This guide provides step-by-step instructions for deploying the Smart Waste Management System to Netlify.

## Deployment Options

### Option 1: Frontend-Only Deployment (Recommended)

Deploy just the frontend to Netlify and host the backend separately on Railway, Render, or Heroku.

#### Prerequisites
- GitHub repository with your code
- Netlify account
- Backend deployed separately (optional for demo)

#### Steps:

1. **Connect Repository to Netlify**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub" and authorize
   - Select your `smart-waste-management` repository

2. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: (leave empty)
   Publish directory: frontend (or leave empty if base directory is set)
   ```

3. **Environment Variables** (if using live backend)
   - Go to Site settings → Environment variables
   - Add your backend API URL:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at a generated netlify.app URL

### Option 2: Full-Stack Deployment with Netlify Functions

Deploy both frontend and backend using Netlify Functions (serverless).

#### Prerequisites
- All files from Option 1
- MongoDB Atlas account (for database)

#### Additional Setup Required:

1. **Create Functions Directory**
   ```bash
   mkdir -p netlify/functions
   ```

2. **Convert Backend Routes to Functions**
   - Each API endpoint becomes a separate function
   - Functions use event/callback pattern
   - Example function structure:
   ```javascript
   exports.handler = async (event, context) => {
     // Your API logic here
     return {
       statusCode: 200,
       body: JSON.stringify({ data: 'your response' })
     };
   };
   ```

3. **Use `netlify-functions.toml`**
   - Rename `netlify-functions.toml` to `netlify.toml`
   - This configuration handles function routing

4. **Update Package.json**
   - Add netlify-lambda for local development:
   ```bash
   npm install --save-dev netlify-lambda
   ```

## Build Configuration Files

### netlify.toml (Frontend Only)
```toml
[build]
  base = "frontend"
  publish = "."
  command = ""

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
  force = true
```

### _headers (Optional - for enhanced security)
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.js
  Cache-Control: public, max-age=31536000

/*.css
  Cache-Control: public, max-age=31536000

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

### _redirects (Alternative to netlify.toml redirects)
```
# API redirect to external backend
/api/* https://your-backend-url.com/api/:splat 200

# SPA fallback
/* /index.html 200
```

## Environment Variables

Set these in Netlify dashboard under Site settings → Environment variables:

### For Frontend-Only Deployment:
```
API_BASE_URL=https://your-backend-url.com/api
NODE_ENV=production
```

### For Full-Stack Deployment:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartwaste
API_KEY=your-maps-api-key
JWT_SECRET=your-jwt-secret-key
```

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Let's Encrypt)

## Deployment Commands

### Manual Deployment
```bash
# Option 1: Direct deploy folder
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=frontend

# Option 2: Git-based deployment (automatic)
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

### Local Development with Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# Test functions locally (if using functions)
netlify functions:serve
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check build logs in Netlify dashboard

2. **API Calls Fail**
   - Update API URLs in frontend code
   - Check CORS settings on backend
   - Verify environment variables

3. **404 Errors**
   - Ensure proper redirects are configured
   - Check publish directory is correct
   - Verify _redirects or netlify.toml rules

4. **Function Errors** (if using functions)
   - Check function syntax and exports
   - Verify environment variables
   - Monitor function logs in Netlify

### Debug Commands:
```bash
# Check current site status
netlify status

# View deployment logs
netlify logs

# Test local build
netlify build

# Debug functions
netlify functions:list
```

## Performance Optimization

1. **Enable Asset Optimization**
   - Go to Site settings → Build & deploy → Post processing
   - Enable "Bundle CSS" and "Minify CSS"
   - Enable "Minify JS"

2. **Configure Headers**
   - Use the _headers file or netlify.toml
   - Set appropriate cache headers
   - Add security headers

3. **Image Optimization**
   - Use Netlify Image CDN
   - Compress images before deployment
   - Consider WebP format support

## Monitoring and Analytics

1. **Enable Analytics**
   - Go to Site overview → Analytics
   - View traffic and performance metrics

2. **Set up Notifications**
   - Site settings → Build & deploy → Deploy notifications
   - Configure Slack/email notifications
   - Set up build failure alerts

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to repository
   - Use Netlify environment variables
   - Rotate keys regularly

2. **Headers and CSP**
   - Implement Content Security Policy
   - Use HTTPS redirect
   - Add security headers

3. **Access Control**
   - Set up branch protection
   - Use deploy previews for testing
   - Configure site access controls if needed

## Next Steps

After successful deployment:

1. Test all functionality on the live site
2. Set up monitoring and error tracking
3. Configure backups for your database
4. Set up CI/CD workflows for updates
5. Monitor performance and optimize as needed

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [Deployment Troubleshooting](https://docs.netlify.com/configure-builds/troubleshooting-tips/)