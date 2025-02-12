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

    // Get the authenticated user's GitHub username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get user data:', await userResponse.text());
      return NextResponse.json({ error: "Failed to verify user identity" }, { status: 401 });
    }

    const userData = await userResponse.json();
    const githubUsername = userData.login;

    // Check if the user is the owner of the repository
    if (owner.toLowerCase() !== githubUsername.toLowerCase()) {
      return NextResponse.json({ 
        error: "You can only add repositories that you own" 
      }, { status: 403 });
    }

    // Verify if the repository exists
    const repoResponse = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({ 
          error: "Repository does not exist. Please check the URL and try again." 
        }, { status: 404 });
      }
      console.error('Failed to verify repository:', await repoResponse.text());
      return NextResponse.json({ 
        error: "Failed to verify repository. Please try again later." 
      }, { status: 500 });
    }

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
    
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('Webhook URL:', webhookUrl);

    // Skip webhook creation in development mode
    let webhookId;
    
    if (process.env.NODE_ENV !== 'production') {
      // In non-production mode, skip webhook creation
      console.log('Skipping webhook creation in development mode');
    } else {
      try {
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
              url: `${webhookUrl}/api/webhook`,
              content_type: 'application/json',
              secret: process.env.NEXTAUTH_SECRET || '',
              insecure_ssl: '0'
            }
          })
        });

        const responseText = await webhookResponse.text();
        console.log('Webhook response:', responseText);
        
        if (!webhookResponse.ok) {
          let error;
          try {
            error = JSON.parse(responseText);
          } catch {
            error = { message: responseText };
          }
          
          console.error('Webhook setup error details:', {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            error: error,
            repoFullName: repoFullName,
            webhookUrl: `${webhookUrl}/api/webhook`,
            requestBody: {
              name: 'web',
              active: true,
              events: ['fork'],
              config: {
                url: `${webhookUrl}/api/webhook`,
                content_type: 'application/json',
                secret: process.env.NEXTAUTH_SECRET ? 'present' : 'missing',
                insecure_ssl: '0'
              }
            }
          });
          
          if (error.errors) {
            return NextResponse.json({ 
              error: "Failed to set up webhook: " + error.errors.map((e: { message: string }) => e.message).join(', '),
              details: error.errors
            }, { status: webhookResponse.status });
          }
          
          return NextResponse.json({ 
            error: "Failed to set up webhook: " + (error.message || responseText),
            details: error
          }, { status: webhookResponse.status });
        }

        const webhook = JSON.parse(responseText);
        webhookId = webhook.id;
      } catch (error) {
        console.error('Error during webhook setup:', error);
        return NextResponse.json({ 
          error: "Failed to set up webhook: " + (error instanceof Error ? error.message : String(error))
        }, { status: 500 });
      }
    }

    // Save repository to database (happens in all environments)
    await db.collection("repositories").insertOne({
      repoUrl: repoFullName,
      userEmail: session.user.email,
      webhookId: webhookId, // will be undefined in non-production
      createdAt: new Date(),
      webhookUrl: `${webhookUrl}/api/webhook`
    });

    return NextResponse.json({ 
      status: "success",
      message: process.env.NODE_ENV === 'production' ? 
        "Repository added successfully with webhook" : 
        "Repository added successfully"
    });
  } catch (error) {
    console.error("Error adding repository:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
}