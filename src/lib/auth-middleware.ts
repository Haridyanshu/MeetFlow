import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { auth } = NextAuth({
  providers: [Google, GitHub],
  pages: {
    signIn: "/login",
  },
})
