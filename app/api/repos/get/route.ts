import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";

export async function GET() {
  try {
    const db = client.db(dbName);
    const collection = db.collection("repositories");

    const repositories = await collection.find({}).toArray();

    // Convert MongoDB ObjectId to a string
    const serializedRepos = repositories.map((repo) => ({
      ...repo,
      _id: repo._id.toString(),
    }));

    return NextResponse.json(serializedRepos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
