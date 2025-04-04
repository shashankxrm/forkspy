import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoClient } from "mongodb";

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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'read:user user:email repo admin:repo_hook write:repo_hook',
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin'
  },
  callbacks: {
    async signIn({ user}) {
      if (!user.email) return false;
      
      const client = new MongoClient(process.env.MONGO_URI!);
      try {
        await client.connect();
        const db = client.db("forkspy");
        
        // Upsert the user
        await db.collection("users").updateOne(
          { email: user.email },
          { 
            $set: { 
              email: user.email,
              name: user.name,
              image: user.image,
              lastSignIn: new Date()
            }
          },
          { upsert: true }
        );
        
        return true;
      } catch (error) {
        console.error('Error saving user:', error);
        return false;
      } finally {
        await client.close();
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is a callback URL from GitHub OAuth
      if (url.includes('callback') && url.includes('github')) {
        return `${baseUrl}/dashboard`;
      }
      
      // If it's our own URL, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // If it's GitHub URL, allow it
      if (url.startsWith('https://github.com')) {
        return url;
      }
      
      // Default to dashboard for successful auth
      return `${baseUrl}/dashboard`;
    }
  },
  debug: process.env.NODE_ENV === 'development',
};