import { auth, signIn, signOut } from "@/lib/auth"

export async function getSession() {
  return auth()
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function signInWithProvider(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" })
}

export async function signOutUser() {
  await signOut({ redirectTo: "/login" })
}
