# 🚀 Deployment Guide

This guide will help you deploy the Pasta Cook Timer app to various hosting platforms, similar to how Globe hosts Flutter apps.

## Quick Comparison

| Platform | Ease | Free Tier | Best For |
|----------|------|-----------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ✅ Yes | React/Vite apps (Recommended) |
| **Netlify** | ⭐⭐⭐⭐⭐ | ✅ Yes | Static sites |
| **GitHub Pages** | ⭐⭐⭐⭐ | ✅ Yes | Open source projects |
| **Railway** | ⭐⭐⭐⭐ | ✅ Limited | Full-stack apps |

---

## 🎯 Option 1: Vercel (Recommended - Most Similar to Globe)

Vercel is the easiest platform for React/Vite apps, similar to how Globe works for Flutter.

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/pasta-cook.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Done!** Your app is live at `your-app.vercel.app`

### Custom Domain:
- Go to Project Settings → Domains
- Add your custom domain
- Vercel handles SSL automatically

### Environment Variables:
- Project Settings → Environment Variables
- Add any API keys or configs needed

---

## 🌐 Option 2: Netlify

Similar to Vercel, great for static sites.

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Done!** Your app is live at `your-app.netlify.app`

### Continuous Deployment:
- Automatically deploys on every push to `main`
- Preview deployments for pull requests

---

## 📄 Option 3: GitHub Pages

Free hosting for open source projects.

### Steps:

1. **Enable GitHub Actions**
   - The `.github/workflows/deploy.yml` file is already configured
   - Just push to GitHub

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

3. **Deploy**
   - Push to `main` branch
   - GitHub Actions will build and deploy automatically

4. **Done!** Your app is live at `yourusername.github.io/pasta-cook`

### Note:
- Update `vite.config.ts` base path if needed
- Currently configured for root deployment

---

## 🚂 Option 4: Railway

Good for full-stack apps with databases.

### Steps:

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

## 🔧 Manual Deployment

If you want to deploy manually to any static hosting:

```bash
# Build the app
npm run build

# The dist/ folder contains your production app
# Upload everything in dist/ to your hosting provider
```

### Hosting Providers:
- **Cloudflare Pages**: Free, fast CDN
- **Firebase Hosting**: Google's hosting
- **AWS S3 + CloudFront**: Enterprise-grade
- **DigitalOcean App Platform**: Simple PaaS

---

## 📱 Testing Production Build Locally

Before deploying, test your production build:

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit `http://localhost:4173` to test the production build.

---

## 🔐 Environment Variables

If you need environment variables:

### Vercel:
- Project Settings → Environment Variables
- Add variables for Production, Preview, Development

### Netlify:
- Site Settings → Environment Variables
- Add variables

### Access in Code:
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
```

---

## 🎨 Custom Domain Setup

### Vercel:
1. Project Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. SSL is automatic

### Netlify:
1. Site Settings → Domain Management
2. Add custom domain
3. Configure DNS
4. SSL is automatic

---

## 🐛 Troubleshooting

### Build Fails:
- Check Node.js version (should be 18+)
- Run `npm install` locally first
- Check build logs for errors

### Routes Not Working:
- Ensure SPA rewrite rules are configured
- Check `vercel.json` or `netlify.toml`

### Assets Not Loading:
- Check `vite.config.ts` base path
- Ensure relative paths are used

---

## 📊 Performance Tips

1. **Enable Compression**: Most platforms do this automatically
2. **CDN**: Vercel/Netlify use global CDN automatically
3. **Caching**: Configure cache headers if needed
4. **Image Optimization**: Use WebP format for images

---

## 🎯 Recommended: Vercel

For React/Vite apps, **Vercel** is the closest experience to Globe:
- ✅ Zero configuration needed
- ✅ Automatic deployments from GitHub
- ✅ Free tier with generous limits
- ✅ Global CDN
- ✅ SSL certificates
- ✅ Preview deployments
- ✅ Custom domains

**Get started:** [vercel.com](https://vercel.com)

---

*Happy deploying! 🚀*

