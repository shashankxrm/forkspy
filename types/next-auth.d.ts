import { DefaultSession } from "next-auth";

// Extend the default Session type to include accessToken
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
  }

  interface User {
    accessToken?: string;
  }
}
