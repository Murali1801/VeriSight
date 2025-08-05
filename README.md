# VeriSight - AI Fake News Detection System

A modern web application built with Next.js 15, TypeScript, and Firebase for AI-powered fake news and deepfake detection.

## 🚀 Features

- **AI-Powered Detection**: Analyze text, images, and videos for authenticity
- **User Authentication**: Secure Firebase Authentication with email/password
- **Real-time Database**: Firestore for storing user data and analysis results
- **Community Features**: Voting system and user karma
- **Modern UI**: Beautiful, responsive design with dark/light mode
- **Protected Routes**: Secure access to authenticated pages

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase project

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-detection-system
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (for Google sign-in)
3. Create a Firestore database
4. Get your Firebase config from Project Settings

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own analyses
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth != null);
    }
    
    // Users can read/write their own votes
    match /votes/{voteId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth != null);
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ai-detection-system/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── profile/          # User profile
│   ├── settings/         # User settings
│   ├── signin/           # Sign in page
│   └── signup/           # Sign up page
├── components/            # React components
│   ├── ui/              # shadcn/ui components
│   ├── navbar.tsx       # Navigation component
│   └── protected-route.tsx # Route protection
├── contexts/             # React contexts
│   └── auth-context.tsx # Authentication context
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── firebase.ts      # Firebase configuration
│   └── user-service.ts  # Firestore operations
└── public/              # Static assets
```

## 🔐 Authentication Flow

1. **Landing Page**: Redirects authenticated users to dashboard
2. **Sign Up**: Users create accounts with email/password or Google
3. **Sign In**: Email/password or Google authentication
4. **User Profile**: Firebase creates user document in Firestore
5. **Dashboard Access**: Protected route with automatic redirect to signin
6. **User Data**: Stored in Firestore with user-specific collections
7. **Google Integration**: Automatic profile creation for new Google users
8. **Logout**: Redirects to signin page

### Routing Flow:
- **Unauthenticated Users**: Landing page → Sign in/Sign up → Dashboard
- **Authenticated Users**: Any page → Dashboard (automatic redirect)
- **Protected Pages**: Dashboard, Profile, Settings require authentication
- **Auth Pages**: Sign in/Sign up redirect to dashboard if already authenticated

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string
  email: string
  displayName: string
  createdAt: string
  karma: number
  totalAnalyses: number
  accuracyRate: number
  communityVotes: number
  badges: string[]
  photoURL?: string
}
```

### Analyses Collection
```typescript
{
  id: string
  userId: string
  type: "text" | "image" | "video"
  content: string
  verdict: "FAKE" | "REAL"
  credibilityScore: number
  summary: string
  sources: string[]
  breakdown: {
    textAnalysis: number
    imageAnalysis: number
    sourceVerification: number
    communityFeedback: number
  }
  createdAt: string
  communityVotes: {
    up: number
    down: number
  }
}
```

### Votes Collection
```typescript
{
  userId: string
  analysisId: string
  vote: "up" | "down"
  createdAt: string
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages**: Add to `app/` directory
2. **Components**: Add to `components/` directory
3. **Firebase Operations**: Add to `lib/user-service.ts`
4. **Styling**: Use Tailwind CSS classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a demo application. For production use, implement proper AI detection APIs and additional security measures. 