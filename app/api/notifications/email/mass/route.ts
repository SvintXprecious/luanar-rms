import { sendApplicationStatusEmail } from '@/app/Services/EmailService';
import { NextRequest, NextResponse } from 'next/server';

type ApplicationStatus = "shortlisted" | "rejected";

interface EmailRequest {
  to: string;
  jobTitle: string;
  applicantName: string;
  status: ApplicationStatus;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients }: { recipients: EmailRequest[] } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each recipient's data
    const invalidRecipients = recipients.filter(
      r => !r.to || !r.jobTitle || !r.applicantName || !r.status ||
          !["shortlisted", "rejected"].includes(r.status)
    );

    if (invalidRecipients.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some recipients have missing required fields or invalid status',
          invalidRecipients 
        },
        { status: 400 }
      );
    }

    // Process all emails
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        sendApplicationStatusEmail({
          to: recipient.to,
          jobTitle: recipient.jobTitle,
          applicantName: recipient.applicantName,
          status: recipient.status
        })
      )
    );

    // Analyze results
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;
    const failedEmails = results
      .map((result, index) => 
        result.status === 'rejected' 
          ? { 
              email: recipients[index].to,
              error: (result as PromiseRejectedResult).reason?.message || 'Unknown error'
            }
          : null
      )
      .filter(Boolean);

    return NextResponse.json({
      message: `Successfully sent ${successCount} emails, ${failedCount} failed`,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      success: failedCount === 0
    });

  } catch (error) {
    console.error('Error sending mass emails:', error);
    return NextResponse.json(
      { error: 'Failed to send mass emails' },
      { status: 500 }
    );
  }
}