# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Firebase Project**: Ensure your Firebase project is set up

## Step 1: Prepare Your Repository

Your project is already well-structured for Vercel deployment with:
- ✅ Next.js 15
- ✅ TypeScript configuration
- ✅ Proper build scripts
- ✅ Firebase integration
- ✅ Environment variables setup

## Step 2: Environment Variables

You'll need to configure these environment variables in Vercel:

### Required Firebase Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure environment variables:
   - Go to Project Settings → Environment Variables
   - Add all the Firebase variables listed above
5. Deploy!

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and configure environment variables when asked.

## Step 4: Post-Deployment

1. **Test Your App**: Visit your deployed URL and test all features
2. **Custom Domain** (Optional): Add a custom domain in Vercel dashboard
3. **Environment Variables**: Ensure all Firebase variables are set correctly
4. **Firebase Rules**: Update Firebase security rules for production

## Troubleshooting

### Common Issues:

1. **Build Errors**: Check the build logs in Vercel dashboard
2. **Environment Variables**: Ensure all Firebase variables are set
3. **Firebase Permissions**: Update Firebase security rules for production
4. **CORS Issues**: Configure Firebase Auth domains in Firebase console

### Firebase Configuration for Production:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Update Firebase security rules for production

## Performance Optimization

Your `next.config.mjs` already includes optimizations:
- ✅ Unoptimized images for faster builds
- ✅ ESLint and TypeScript errors ignored during builds
- ✅ Proper Next.js 15 configuration

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Vercel's built-in error reporting
- Monitor Firebase usage in Firebase Console

## Automatic Deployments

Vercel will automatically deploy when you push to your main branch. Each pull request will create a preview deployment. 