# 🚀 GitHub Pages Deployment Guide

Step-by-step guide to deploy your Pasta Cook Timer app to GitHub Pages.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Node.js installed (for local testing)

---

## 🎯 Step-by-Step Setup

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `pasta-cook` (or any name you prefer)
4. Description: "Visual pasta cooking timer for commercial kitchens"
5. Choose **Public** (required for free GitHub Pages)
6. **Don't** initialize with README (we already have files)
7. Click **"Create repository"**

---

### Step 2: Push Your Code to GitHub

Open your terminal in the project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Pasta Cook Timer app"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pasta-cook.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
   - (Don't select "Deploy from a branch")
5. Click **Save**

---

### Step 4: Trigger First Deployment

The GitHub Actions workflow will automatically run when you push to `main`. 

**Option A: Already pushed?**
- Go to **Actions** tab in your repository
- You should see the workflow running
- Wait for it to complete (green checkmark)

**Option B: Need to trigger manually?**
- Make a small change (add a space in README.md)
- Commit and push:
  ```bash
  git add .
  git commit -m "Trigger deployment"
  git push
  ```

---

### Step 5: Access Your Live App

Once deployment completes:

1. Go to **Settings** → **Pages**
2. Your site URL will be shown:
   ```
   https://YOUR_USERNAME.github.io/pasta-cook/
   ```
3. It may take 1-2 minutes to be live
4. Click the URL to open your app!

---

## 🔄 Automatic Deployments

Every time you push to the `main` branch:
- GitHub Actions automatically builds your app
- Deploys to GitHub Pages
- Your site updates automatically

**No manual steps needed!**

---

## 🛠️ Troubleshooting

### Workflow Not Running?

1. Check **Actions** tab for errors
2. Make sure branch is named `main` (not `master`)
3. Verify `.github/workflows/deploy.yml` exists

### Build Fails?

1. Check Actions tab → Click failed workflow → See logs
2. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Run `npm run build` locally first
   - Node version → Should be 18+

### Site Shows 404?

1. Wait 1-2 minutes after deployment
2. Check Settings → Pages → Source is "GitHub Actions"
3. Verify workflow completed successfully (green checkmark)

### Assets Not Loading?

- Check `vite.config.ts` has `base: './'`
- Clear browser cache
- Check browser console for errors

---

## 🎨 Custom Domain (Optional)

Want to use your own domain?

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Follow DNS setup instructions
4. GitHub will provide SSL certificate automatically

---

## 📱 Testing Locally Before Deploying

Test your production build locally:

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit `http://localhost:4173` to test.

---

## 🔍 Check Deployment Status

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. See build logs and deployment status
4. Green checkmark = Success ✅
5. Red X = Failed ❌ (check logs)

---

## 📝 Quick Commands Reference

```bash
# Make changes, then deploy
git add .
git commit -m "Your commit message"
git push

# Check deployment status
# Go to GitHub → Actions tab
```

---

## ✅ Success Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Workflow ran successfully (green checkmark)
- [ ] Site is live at `https://YOUR_USERNAME.github.io/pasta-cook/`

---

## 🎉 You're Done!

Your app is now live on GitHub Pages, just like Globe hosts Flutter apps!

**Your URL:** `https://YOUR_USERNAME.github.io/pasta-cook/`

Share it with the world! 🌍

---

*Need help? Check the Actions tab for detailed logs.*

