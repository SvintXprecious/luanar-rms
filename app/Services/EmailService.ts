import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    ciphers: string;
    rejectUnauthorized: boolean;
  };
  pool: boolean;
  maxConnections: number;
  maxMessages: number;
}

// Validate required environment variables
const requiredEnvVars = ['SMTP_PASS'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const emailConfig: EmailConfig = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ptsetekani@luanar.ac.mw',
    pass: process.env.SMTP_PASS!
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  // Connection pool settings for better performance
  pool: true,
  maxConnections: 3,
  maxMessages: 100
};

const transporter = nodemailer.createTransport(emailConfig);

interface SendEmailParams {
  to: string;
  jobTitle: string;
  applicantName: string;
  status: 'shortlisted' | 'rejected';
}

// Verify connection on startup
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('SMTP Connection failed:', error);
    throw error;
  }
};

// Email templates with better HTML formatting
const getEmailTemplate = (
  status: 'shortlisted' | 'rejected',
  { jobTitle, applicantName }: Omit<SendEmailParams, 'to' | 'status'>
) => {
  const luanarSignature = `
    <p>For any inquiries, do not hesitate to contact the HR Office using the contact details provided below.</p>
    
    <p>Regards,</p>
    
    <p style="margin: 0;">DASTON R. MPANDO</p>
    <p style="margin: 0;">ASSISTANT REGISTRAR (HUMAN RESOURCES MANAGEMENT)</p>
    <p style="margin: 0;">LILONGWE UNIVERSITY OF AGRICULTURE & NATURAL RESOURCES</p>
    <p style="margin: 0;">P.O. BOX 219, LILONGWE, MALAWI</p>
    <p style="margin: 0;">CELL: +265 880 41 41 20 / 995 88 77 66</p>
    <p style="margin: 0;">EMAIL: dmpando@luanar.ac.mw</p>
  <p style="margin-top: 10px; font-style: italic; font-weight: bold;">"Hire to get RESULTS not REASONS"</p>
  `;

  const templates = {
    shortlisted: {
      subject: `Congratulations! You've Been Shortlisted for ${jobTitle} at LUANAR`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 30px; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>Dear ${applicantName},</p>
            </div>
            
            <p>We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position at LUANAR has been shortlisted.</p>
            
            <p>Our hiring team was impressed with your qualifications and experience. The specific date, time, and venue for your interview will be communicated to you shortly. Please ensure to monitor your email for these important details.</p>
            
            <div class="footer">
              ${luanarSignature}
            </div>
          </div>
        </body>
        </html>
      `
    },
    rejected: {
      subject: `Update on Your Application for ${jobTitle} at LUANAR`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 30px; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>Dear ${applicantName},</p>
            </div>
            
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at LUANAR and for taking the time to apply.</p>
            
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
            
            <p>We appreciate your interest in LUANAR and wish you the best in your job search.</p>
            
            <div class="footer">
              ${luanarSignature}
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[status];
};

export const sendApplicationStatusEmail = async ({
  to,
  jobTitle,
  applicantName,
  status
}: SendEmailParams) => {
  try {
    const { subject, html } = getEmailTemplate(status, { jobTitle, applicantName });

    const info = await transporter.sendMail({
      from: {
        name: 'LUANAR HR',
        address: 'ptsetekani@luanar.ac.mw'
      },
      to,
      subject,
      html,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

// Initialize verification
verifyConnection().catch(console.error);

export default sendApplicationStatusEmail;