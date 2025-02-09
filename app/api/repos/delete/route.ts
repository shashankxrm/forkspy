import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get('repoId');
    
    if (!repoId) {
      return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Find the repository to get its webhook ID
    const repo = await db.collection("repositories").findOne({
      _id: new ObjectId(repoId),
      userEmail: session.user.email
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Delete the webhook from GitHub if it exists
    if (repo.webhookId) {
      try {
        // Extract owner and repo name from the repo URL (format: username/reponame)
        const [owner, repoName] = repo.repoUrl.split('/');
        
        if (!owner || !repoName) {
          console.error('Invalid repository format:', repo.repoUrl);
          return NextResponse.json({ error: "Invalid repository format" }, { status: 400 });
        }

        const deleteWebhookUrl = `https://api.github.com/repos/${owner}/${repoName}/hooks/${repo.webhookId}`;
        
        const response = await fetch(deleteWebhookUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        // Log the response for debugging
        if (!response.ok && response.status !== 404) {
          const errorText = await response.text();
          console.error('Failed to delete webhook:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            url: deleteWebhookUrl
          });
          return NextResponse.json({ 
            error: "Failed to delete webhook",
            details: `Status: ${response.status} - ${errorText}`
          }, { status: 500 });
        }
      } catch (error) {
        console.error('Error during webhook deletion:', error);
        return NextResponse.json({ 
          error: "Failed to delete webhook",
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Delete the repository from our database
    const result = await db.collection("repositories").deleteOne({
      _id: new ObjectId(repoId),
      userEmail: session.user.email
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete repository" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting repository:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
