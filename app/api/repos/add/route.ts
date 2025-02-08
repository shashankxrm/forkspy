import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();

    // Validate that `repoUrl` exists
    if (!body.repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Extract owner and repo from the URL
    const repoUrlMatch = body.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoUrlMatch) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const [, owner, repo] = repoUrlMatch;
    const repoFullName = `${owner}/${repo}`;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Check if repository is already being tracked by this user
    const existingRepo = await db.collection("repositories").findOne({
      repoUrl: repoFullName,
      userEmail: session.user.email
    });

    if (existingRepo) {
      return NextResponse.json({ error: "Repository is already being tracked" }, { status: 400 });
    }

    // Set up webhook using GitHub API
    const webhookResponse = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['fork'],
        config: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
          content_type: 'json',
          insecure_ssl: '0'
        }
      })
    });

    if (!webhookResponse.ok) {
      const error = await webhookResponse.json();
      return NextResponse.json({ error: "Failed to set up webhook: " + error.message }, { status: 400 });
    }

    const webhook = await webhookResponse.json();

    // Save repository to database
    await db.collection("repositories").insertOne({
      repoUrl: repoFullName,
      userEmail: session.user.email,
      webhookId: webhook.id,
      createdAt: new Date()
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error adding repository:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
}
