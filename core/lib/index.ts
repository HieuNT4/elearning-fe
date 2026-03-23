export { cn } from "./utils";
export { authOptions } from "./auth";
export { api, type ApiError, type ApiResponse } from "./api-client";
export { default as apiClient } from "./api-client";

// Firebase
export {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  resetPassword,
  confirmReset,
  getCurrentUser,
  onAuthChange,
  auth as firebaseAuth,
  type FirebaseUser,
} from "./firebase";
