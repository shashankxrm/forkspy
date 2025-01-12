import type {NextAuthOptions} from "next-auth";
import GithubProvider from "next-auth/providers/github";

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
        })
    ],
}; 
   