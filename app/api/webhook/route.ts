import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

function getMongoClient() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  return new MongoClient(mongoUri, {
    connectTimeoutMS: 10000, // 10 seconds
    serverSelectionTimeoutMS: 5000, // 5 seconds
    socketTimeoutMS: 45000,  // 45 seconds
  });
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

const dbName = "forkspy";

export async function POST(req: NextRequest) {
  let db;
  let client: MongoClient | null = null;
  
  try {
    try {
      console.log('========= WEBHOOK EVENT RECEIVED =========');
      console.log('Method:', req.method);
      console.log('Headers:', Object.fromEntries(req.headers.entries()));
      
      let payload;
      const contentType = req.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        payload = await req.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        const payloadStr = formData.get('payload');
        if (typeof payloadStr === 'string') {
          payload = JSON.parse(payloadStr);
        } else {
          throw new Error('Invalid payload format');
        }
      } else {
        throw new Error(`Unsupported content type: ${contentType}`);
      }
      console.log('Webhook Event Type:', payload.event || payload.action);
      console.log('Full Payload:', JSON.stringify(payload, null, 2));
      
      // Verify that this is a fork event
      if (!payload.forkee) {
        console.log('Not a fork event - missing forkee data');
        return NextResponse.json({ status: 'ignored', reason: 'Not a fork event' });
      }

      client = getMongoClient();
      await client.connect();
      db = client.db(dbName);
      
      // Get the original repository details
      const originalRepo = payload.repository.full_name;
      console.log('Processing fork event for repository:', originalRepo);
      
      // Find users tracking this repository
      const trackedRepo = await db.collection('repositories').findOne({
        repoUrl: originalRepo
      });
      console.log('Found tracked repo:', {
        repoUrl: trackedRepo?.repoUrl,
        userEmail: trackedRepo?.userEmail,
        webhookId: trackedRepo?.webhookId
      });

      if (!trackedRepo) {
        console.log('No subscribers found for repository:', originalRepo);
        return NextResponse.json({ status: 'no_subscribers', repository: originalRepo });
      }

      // Get user details
      const user = await db.collection('users').findOne({
        email: trackedRepo.userEmail
      });
      console.log('Found user details:', {
        searchEmail: trackedRepo.userEmail,
        foundEmail: user?.email,
        emailMatch: user?.email === trackedRepo.userEmail
      });

      if (!user) {
        console.log('User not found for email:', trackedRepo.userEmail);
        return NextResponse.json({ status: 'user_not_found', email: trackedRepo.userEmail });
      }

      // Send email notification
      console.log('Attempting to send email to:', user.email);
      try {
        if (!process.env.RESEND_API_KEY) {
          console.error('RESEND_API_KEY is not set');
          return NextResponse.json({ status: 'email_error', error: 'Email service not configured' });
        }
        
        console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
        console.log('Preparing email with data:', {
          to: user.email,
          subject: `New Fork Alert: ${originalRepo}`,
          repository: originalRepo,
          forkedBy: payload.sender.login,
          forkUrl: payload.forkee.html_url
        });
        
        const resend = getResendClient();
        const emailResponse = await resend.emails.send({
          from: 'ForkSpy <onboarding@resend.dev>',
          to: user.email,
          subject: `New Fork Alert: ${originalRepo}`,
          html: `
            <h2>New Fork Alert!</h2>
            <p>Your repository <strong>${originalRepo}</strong> has been forked by <strong>${payload.sender.login}</strong>.</p>
            <p>Fork Details:</p>
            <ul>
          <li>Fork URL: <a href="${payload.forkee.html_url}">${payload.forkee.full_name}</a></li>
          <li>Forked by: <a href="${payload.sender.html_url}">${payload.sender.login}</a></li>
          <li>Created at: ${new Date(payload.forkee.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
            </ul>
            <p>View the fork: <a href="${payload.forkee.html_url}">${payload.forkee.html_url}</a></p>
          `
        });
        console.log('Email Response:', emailResponse);
        console.log('Email sent successfully:', emailResponse);
      } catch (error: unknown) {
        console.error('Failed to send email:', error);
        
        const errorMessage = error instanceof Error 
          ? { name: error.name, message: error.message, stack: error.stack }
          : { name: 'UnknownError', message: String(error), stack: undefined };
        
        console.error('Error details:', errorMessage);
        
        return NextResponse.json({ 
          status: 'email_error', 
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          errorDetails: {
            name: errorMessage.name,
            message: errorMessage.message
          }
        });
      }

      return NextResponse.json({ status: 'success' });
    } catch (error) {
      console.error('Webhook error:', error);
      console.error('Full error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    } finally {
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing MongoDB connection:', closeError);
        }
      }
    }
  } catch (error) {
    console.error('Outer error:', error);
    console.error('Full error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}