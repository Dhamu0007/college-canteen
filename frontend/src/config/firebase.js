import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCi43khqSg9dx1kNY9K3rdXsUIaD0gqUnI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "collegecanteen-c8068.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "collegecanteen-c8068",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "collegecanteen-c8068.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "827654687066",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:827654687066:web:68202df9cc2304a28ccb63",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8FR0R9WJJZ"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export default app
