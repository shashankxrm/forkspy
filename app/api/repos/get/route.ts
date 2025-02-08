import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Server-side session:', session); // Debug log

    if (!session?.user?.email) {
      console.log('No session or email found'); // Debug log
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("repositories");

    // Only fetch repositories for the current user
    const repositories = await collection.find({
      userEmail: session.user.email
    }).toArray();

    // Convert MongoDB ObjectId to a string
    const serializedRepos = repositories.map((repo) => ({
      ...repo,
      _id: repo._id.toString(),
    }));

    return NextResponse.json(serializedRepos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  } finally {
    await client.close();
  }
}
