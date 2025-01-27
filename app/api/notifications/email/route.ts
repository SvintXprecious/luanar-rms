import { sendApplicationStatusEmail } from '@/app/Services/EmailService';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, jobTitle, applicantName, status } = body;

    if (!to || !jobTitle || !applicantName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    await sendApplicationStatusEmail({
      to,
      jobTitle,
      applicantName,
      status
    });

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}