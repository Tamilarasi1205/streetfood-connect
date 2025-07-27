# FreshConnect - Vercel Deployment Guide

## 🚀 Frontend Deployment on Vercel

### Prerequisites
- Backend deployed on Render/Railway/etc. (get the URL)
- Vercel account connected to your GitHub repository

### Step 1: Vercel Project Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build:client
   Output Directory: dist/spa
   Install Command: npm install
   ```

### Step 2: Environment Variables

In your Vercel project dashboard, add these environment variables:

**Required:**
```env
VITE_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

**Optional (for enhanced functionality):**
```env
VITE_GOOGLE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### Step 3: Deploy

1. **Manual Deploy**: Click "Deploy" in Vercel dashboard
2. **Automatic Deploy**: Push to your main branch

## 🔧 Verification Checklist

Once deployed, verify these items on your Vercel URL:

### ✅ **Frontend Verification**
- [ ] Homepage loads with FreshConnect branding
- [ ] All navigation links work (Login, Register, Dashboards)
- [ ] No 404 errors on page refresh
- [ ] Responsive design works on mobile

### ✅ **API Connection Verification**
- [ ] Login form submits without CORS errors
- [ ] Products load on vendor dashboard
- [ ] Registration form works
- [ ] Protected routes redirect to login

### ✅ **Route Verification**
Test these URLs directly:
- [ ] `https://your-app.vercel.app/` - Homepage
- [ ] `https://your-app.vercel.app/login` - Login page
- [ ] `https://your-app.vercel.app/register` - Registration
- [ ] `https://your-app.vercel.app/vendor-dashboard` - Should redirect to login
- [ ] `https://your-app.vercel.app/supplier-dashboard` - Should redirect to login
- [ ] `https://your-app.vercel.app/group-orders` - Should redirect to login

## 🔍 Troubleshooting Common Issues

### Issue 1: Blank Page or Build Errors
**Symptoms**: White screen, "Application error" message
**Solutions**:
1. Check Vercel build logs for errors
2. Ensure `build:client` command exists in package.json
3. Verify `dist/spa` directory is created during build
4. Check for TypeScript errors

### Issue 2: API Calls Failing
**Symptoms**: Network errors, CORS issues, 404 on API calls
**Solutions**:
1. Verify `VITE_API_URL` environment variable is set correctly
2. Ensure backend URL is accessible (test manually)
3. Check backend CORS configuration allows Vercel domain
4. Verify API endpoints respond correctly

### Issue 3: 404 on Page Refresh
**Symptoms**: Direct URL access shows 404, but navigation works
**Solutions**:
1. Ensure `vercel.json` exists with proper rewrites
2. Check Vercel Functions configuration
3. Verify SPA routing is properly configured

### Issue 4: Environment Variables Not Working
**Symptoms**: API calls go to wrong URL or fail
**Solutions**:
1. Check environment variables in Vercel dashboard
2. Ensure variables start with `VITE_` prefix
3. Redeploy after adding environment variables
4. Check browser network tab for actual API URLs

## 📊 Testing Your Deployment

### Manual Testing Steps

1. **Homepage Test**
   ```
   Visit: https://your-app.vercel.app
   Expected: FreshConnect homepage with navigation
   ```

2. **Authentication Test**
   ```
   Visit: https://your-app.vercel.app/login
   Try: Demo credentials (should show API response)
   ```

3. **Protected Route Test**
   ```
   Visit: https://your-app.vercel.app/vendor-dashboard
   Expected: Redirect to login page
   ```

4. **API Connection Test**
   Open browser console and check for:
   - No CORS errors
   - API calls going to correct backend URL
   - Proper response from backend

### Automated Testing

```bash
# Test homepage
curl -I https://your-app.vercel.app

# Test SPA routing
curl -I https://your-app.vercel.app/login

# Test API connectivity (should fail with CORS, but shows connection)
curl https://your-backend.onrender.com/api/ping
```

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Add domain in Vercel project settings
2. Configure DNS records as shown in Vercel
3. Update CORS configuration in backend

### Performance Optimization
- Enable Edge Functions for better performance
- Configure caching headers in `vercel.json`
- Use Vercel Analytics for monitoring

### Security Headers
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📞 Getting Help

If you encounter issues:

1. **Check Vercel Build Logs**: Go to Deployments tab in Vercel dashboard
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test Backend Separately**: Verify your backend API is accessible
4. **Check Browser Console**: Look for JavaScript errors or network issues

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Vercel URL loads the FreshConnect homepage
- ✅ All routes work without 404 errors
- ✅ Login form attempts to connect to backend
- ✅ Protected routes redirect to login
- ✅ No console errors related to missing assets
- ✅ Mobile responsive design works correctly

**Ready to test your Vercel deployment!** 🚀

Provide your Vercel URL and I'll help verify the deployment is working correctly.
