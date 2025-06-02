import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your Firebase project's configuration
// You can find this in your Firebase project settings:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyB9mGnjfnlCCmwDYOFLM2uWQroRGK3OTCc",
  authDomain: "guardianlink-a5ba1.firebaseapp.com",
  projectId: "guardianlink-a5ba1",
  storageBucket: "guardianlink-a5ba1.firebasestorage.app",
  messagingSenderId: "848782406833",
  appId: "1:848782406833:web:43cd52e6d93f315e36de90",
  measurementId: "G-1K9ZLQFF27"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };

/*
Firebase Setup Guide for GuardianLink:

1. Create a Firebase Project:
   - Go to the Firebase console (https://console.firebase.google.com/).
   - Click "Add project" and follow the setup steps.

2. Register a Web App:
   - In your Firebase project, go to Project Overview.
   - Click the Web icon (</>) to add a web app.
   - Register your app and copy the `firebaseConfig` object provided.
   - Paste this `firebaseConfig` object into the `firebaseConfig` constant above in this file (src/lib/firebase.ts).

3. Enable Firebase Authentication:
   - In the Firebase console, go to "Authentication" (under Build).
   - Click "Get started".
   - Under "Sign-in method", enable "Email/Password".

4. Enable Firestore Database:
   - In the Firebase console, go to "Firestore Database" (under Build).
   - Click "Create database".
   - Start in "production mode". Choose your Firestore location.
   - Go to the "Rules" tab in Firestore and update the rules. For development, you can start with rules that allow authenticated users to read/write their own data.
     A good starting point for your contacts would be:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Allow users to read and write their own contacts
         match /users/{userId}/contacts/{contactId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         // You might need to allow users to read their own user document if you store user profiles
         // match /users/{userId} {
         //   allow read, update: if request.auth != null && request.auth.uid == userId;
         // }
       }
     }
     ```
     Publish these rules.

5. (Optional for WhatsApp Integration) Enable Firebase Functions:
   - If you want to implement true automated WhatsApp messaging (instead of opening wa.me links), you'll need backend logic.
   - Firebase Functions is a good option for this. You would set up a function triggered via HTTP that uses an API like Twilio or 360Dialog to send messages.
   - This requires setting up billing on your Firebase project as Functions (outside the free tier) and external API calls can incur costs.
   - This backend setup is beyond the scope of the current UI generation.

6. (Optional) Firebase Hosting:
   - To deploy your web app, you can use Firebase Hosting.
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login: `firebase login`
   - Initialize Firebase in your project: `firebase init hosting` (select your project, choose your public directory - usually 'out' for Next.js static export or configure for SSR).
   - Build your app: `npm run build`
   - Deploy: `firebase deploy`
*/
