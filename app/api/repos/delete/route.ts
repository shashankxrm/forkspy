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
          // Continue with repository deletion even if webhook deletion fails
        } else {
          console.log('Attempting to delete webhook:', {
            owner,
            repoName,
            webhookId: repo.webhookId,
            repoUrl: repo.repoUrl
          });

          const deleteWebhookUrl = `https://api.github.com/repos/${owner}/${repoName}/hooks/${repo.webhookId}`;
          
          // First, try to get the webhook to verify it exists
          const getResponse = await fetch(deleteWebhookUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          if (getResponse.status === 404) {
            console.log('Webhook not found - it may have been deleted already:', deleteWebhookUrl);
            // Webhook doesn't exist, continue with repo deletion
            return;
          }

          if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.error('Failed to verify webhook:', {
              status: getResponse.status,
              statusText: getResponse.statusText,
              error: errorText,
              url: deleteWebhookUrl
            });
            throw new Error(`Failed to verify webhook: ${errorText}`);
          }

          // If webhook exists, delete it
          const deleteResponse = await fetch(deleteWebhookUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });

          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            const errorText = await deleteResponse.text();
            console.error('Failed to delete webhook:', {
              status: deleteResponse.status,
              statusText: deleteResponse.statusText,
              error: errorText,
              url: deleteWebhookUrl,
              token: process.env.GITHUB_ACCESS_TOKEN ? 'Token exists' : 'No token found'
            });
            throw new Error(`Failed to delete webhook: ${errorText}`);
          }

          console.log('Successfully processed webhook deletion request');
        }
      } catch (error) {
        console.error('Error during webhook deletion:', error);
        // Continue with repository deletion even if webhook deletion fails
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
