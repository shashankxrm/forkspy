import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const client = new MongoClient(process.env.MONGO_URI!);
const dbName = "forkspy";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Verify that this is a fork event
    if (payload.action !== 'created' || !payload.forkee) {
      return NextResponse.json({ status: 'ignored' });
    }

    const db = client.db(dbName);
    
    // Get the original repository details
    const originalRepo = payload.repository.full_name;
    
    // Find users tracking this repository
    const trackedRepo = await db.collection('repositories').findOne({
      repoUrl: originalRepo
    });

    if (!trackedRepo) {
      return NextResponse.json({ status: 'no_subscribers' });
    }

    // Get user details
    const user = await db.collection('users').findOne({
      email: trackedRepo.userEmail
    });

    if (!user) {
      return NextResponse.json({ status: 'user_not_found' });
    }

    // Send email notification
    await resend.emails.send({
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

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
