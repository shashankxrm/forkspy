import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Session } from "next-auth";

// Extend the default Session type
interface CustomSession extends Session {
  accessToken?: string;
}

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("GITHUB_ID and GITHUB_SECRET must be set");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: clientId,
      clientSecret: clientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        accessToken: token.accessToken as string
      }
    },
  },
};