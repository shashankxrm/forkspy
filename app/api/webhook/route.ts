import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received webhook payload:', payload);
    
    // Verify that this is a fork event
    if (payload.action !== 'created' || !payload.forkee) {
      return NextResponse.json({ status: 'ignored', reason: 'Not a fork event' });
    }

    const db = client.db(dbName);
    
    // Get the original repository details
    const originalRepo = payload.repository.full_name;
    console.log('Processing fork event for repository:', originalRepo);
    
    // Find users tracking this repository
    const trackedRepo = await db.collection('repositories').findOne({
      repoUrl: originalRepo
    });

    if (!trackedRepo) {
      return NextResponse.json({ status: 'no_subscribers', repository: originalRepo });
    }

    // Get user details
    const user = await db.collection('users').findOne({
      email: trackedRepo.userEmail
    });

    if (!user) {
      return NextResponse.json({ status: 'user_not_found', email: trackedRepo.userEmail });
    }

    // Send email notification
    console.log('Attempting to send email to:', user.email);
    try {
      const emailResponse = await resend.emails.send({
        from: 'ForkSpy <notifications@forkspy.com>',
        to: user.email,
        subject: `New Fork Alert: ${originalRepo}`,
        html: `
          <h2>New Fork Alert!</h2>
          <p>Your repository <strong>${originalRepo}</strong> has been forked by <strong>${payload.sender.login}</strong>.</p>
          <p>Fork Details:</p>
          <ul>
            <li>Fork URL: <a href="${payload.forkee.html_url}">${payload.forkee.full_name}</a></li>
            <li>Forked by: <a href="${payload.sender.html_url}">${payload.sender.login}</a></li>
            <li>Created at: ${new Date(payload.forkee.created_at).toLocaleString()}</li>
          </ul>
          <p>View the fork: <a href="${payload.forkee.html_url}">${payload.forkee.html_url}</a></p>
        `
      });
      console.log('Email sent successfully:', emailResponse);
    } catch (error) {
      console.error('Failed to send email:', error);
      return NextResponse.json({ 
        status: 'email_error', 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
