import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ account }) {
      if (account?.provider === "google") {
        const data: Record<string, string | number | null> = {}
        if (account.access_token) data.access_token = account.access_token
        if (account.refresh_token) data.refresh_token = account.refresh_token
        if (account.expires_at) data.expires_at = account.expires_at
        if (account.scope) data.scope = account.scope
        if (account.id_token) data.id_token = account.id_token
        if (account.token_type) data.token_type = account.token_type
        if (Object.keys(data).length > 0) {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data,
          })
        }
      }
    },
  },
})
