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
    console.log('Received request body:', body);

    // Validate that `repoUrl` exists
    if (!body.repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Extract owner and repo from the URL
    const repoUrlMatch = body.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    console.log('URL match result:', repoUrlMatch);
    
    if (!repoUrlMatch) {
      return NextResponse.json({ error: "Invalid GitHub repository URL. Please use format: https://github.com/username/repository" }, { status: 400 });
    }

    const [, owner, repo] = repoUrlMatch;
    const repoFullName = `${owner}/${repo}`;
    console.log('Repository full name:', repoFullName);

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
    console.log('Setting up webhook for:', repoFullName);
    console.log('Using access token:', session.accessToken ? 'Token present' : 'No token');
    
    // In development, skip webhook creation but still track the repository
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      const webhookResponse = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${session.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['fork'],
          config: {
            url: `https://${process.env.NEXT_PUBLIC_APP_URL?.replace('http://', '').replace('https://', '')}/api/webhook`,
            content_type: 'json',
            insecure_ssl: '0'
          }
        })
      });

      if (!webhookResponse.ok) {
        const error = await webhookResponse.json();
        console.error('Webhook setup error details:', {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          error: error,
          repoFullName: repoFullName,
          webhookUrl: `https://${process.env.NEXT_PUBLIC_APP_URL?.replace('http://', '').replace('https://', '')}/api/webhook`
        });
        return NextResponse.json({ 
          error: "Failed to set up webhook: " + (error.message || JSON.stringify(error)),
          details: error
        }, { status: 400 });
      }

      const webhook = await webhookResponse.json();
      const webhookId = webhook.id;

      // Save repository to database
      await db.collection("repositories").insertOne({
        repoUrl: repoFullName,
        userEmail: session.user.email,
        webhookId: webhookId,
        createdAt: new Date(),
        isDevelopment: isDevelopment
      });
    } else {
      // Save repository to database
      await db.collection("repositories").insertOne({
        repoUrl: repoFullName,
        userEmail: session.user.email,
        webhookId: null,
        createdAt: new Date(),
        isDevelopment: isDevelopment
      });
    }

    return NextResponse.json({ 
      status: "success",
      message: isDevelopment ? 
        "Repository added successfully (webhook creation skipped in development mode)" : 
        "Repository added successfully with webhook"
    });
  } catch (error) {
    console.error("Error adding repository:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
}
