import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

export type Repository = {
  _id: string; // MongoDB ObjectId as a string
  repoUrl: string;
  userEmail: string;
  createdAt: string; // ISO date string
};
