import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth error messages
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Invalid password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/email-already-in-use": "Email is already registered",
    "auth/weak-password": "Password is too weak",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/network-request-failed": "Network error. Please check your connection",
  };
  return errorMessages[errorCode] || "An error occurred. Please try again";
};

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    const firebaseError = error as { code: string };
    throw new Error(getErrorMessage(firebaseError.code));
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return result.user;
  } catch (error) {
    const firebaseError = error as { code: string };
    throw new Error(getErrorMessage(firebaseError.code));
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const firebaseError = error as { code: string };
    throw new Error(getErrorMessage(firebaseError.code));
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const firebaseError = error as { code: string };
    throw new Error(getErrorMessage(firebaseError.code));
  }
}

// Confirm password reset with code
export async function confirmReset(
  code: string,
  newPassword: string
): Promise<void> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error) {
    const firebaseError = error as { code: string };
    throw new Error(getErrorMessage(firebaseError.code));
  }
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Subscribe to auth state changes
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth, app };
export type { FirebaseUser };
