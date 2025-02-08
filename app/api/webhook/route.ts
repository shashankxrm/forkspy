import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log('========= WEBHOOK EVENT RECEIVED =========');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const payload = await req.json();
    console.log('Webhook Event Type:', payload.event || payload.action);
    console.log('Full Payload:', JSON.stringify(payload, null, 2));
    
    // Verify that this is a fork event
    if (!payload.forkee) {
      console.log('Not a fork event - missing forkee data');
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
      
      console.log('Sending email with Resend...');
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
