import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate that `repoUrl` exists
    if (!body.repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const db = client.db(dbName);
    const collection = db.collection("repositories");

    // Insert the repository into MongoDB
    const result = await collection.insertOne({
      repoUrl: body.repoUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Repository added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding repository:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
}
