"use server";

import { redirect } from "next/navigation";

// For NextAuth v4, signOut is handled client-side via next-auth/react
// This action is kept for compatibility but redirects to login
export async function logoutAction() {
  redirect("/api/auth/signout");
}
