import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from "@/auth";
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

async function generateRandomScore(): Promise<number> {
  const score = 50 + Math.random() * 50;
  return parseFloat(score.toFixed(2));
}

async function checkProfileCompleteness(userId: string, client: any) {
  const profileResult = await client.query(
    `SELECT 
      u.first_name, 
      u.last_name, 
      u.email,
      up.phone, 
      up.date_of_birth,
      up.gender
     FROM users u
     LEFT JOIN APP_USER_PROFILES up ON u.id = up.user_id
     WHERE u.id = $1`,
    [userId]
  );

  if (profileResult.rows.length === 0) {
    throw new Error('Profile not found');
  }

  const profile = profileResult.rows[0];
  const missingFields = [];

  if (!profile.first_name) missingFields.push('First Name');
  if (!profile.last_name) missingFields.push('Last Name');
  if (!profile.email) missingFields.push('Email');
  if (!profile.phone) missingFields.push('Phone Number');
  if (!profile.date_of_birth) missingFields.push('Date of Birth');
  if (!profile.gender) missingFields.push('Gender');

  const educationResult = await client.query(
    `SELECT degree, school, location, graduation_year
     FROM APP_USER_EDUCATION
     WHERE user_id = $1`,
    [userId]
  );

  const hasValidEducation = educationResult.rows.some(edu => 
    edu.degree && edu.school && edu.location && edu.graduation_year
  );
  if (!hasValidEducation) {
    missingFields.push('Education Details');
  }

  const experienceResult = await client.query(
    `SELECT title, company, location, start_date
     FROM APP_USER_EXPERIENCE
     WHERE user_id = $1`,
    [userId]
  );

  const hasValidExperience = experienceResult.rows.some(exp => 
    exp.title && exp.company && exp.location && exp.start_date
  );
  if (!hasValidExperience) {
    missingFields.push('Work Experience');
  }

  const skillsResult = await client.query(
    `SELECT COUNT(*) as skill_count
     FROM APP_USER_SKILLS
     WHERE user_id = $1`,
    [userId]
  );

  if (parseInt(skillsResult.rows[0].skill_count) === 0) {
    missingFields.push('Skills');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

async function saveApplicationDocument(
  file: File, 
  userId: string, 
  documentType: 'resume' | 'cover_letter'
): Promise<{ fileUrl: string; fileName: string }> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'applications', userId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueFilename = `${Date.now()}-${documentType}-${file.name}`;
  const filePath = path.join(uploadsDir, uniqueFilename);
  const fileUrl = `/uploads/applications/${userId}/${uniqueFilename}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  return {
    fileUrl,
    fileName: file.name
  };
}

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const userId = await getUserId();
    const formData = await request.formData();
    
    const resume = formData.get('resume') as File;
    const coverLetter = formData.get('coverLetter') as File;
    const jobId = formData.get('jobId') as string;

    if (!resume || !coverLetter || !jobId) {
      throw new Error('Missing required fields');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      throw new Error('Invalid job ID format');
    }

    const profileStatus = await checkProfileCompleteness(userId, client);
    if (!profileStatus.isComplete) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile incomplete',
          missingFields: profileStatus.missingFields
        },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const existingApplication = await client.query(
      `SELECT id, status 
       FROM "APP_JOB_APPLICATIONS" 
       WHERE job_id = $1 AND applicant_id = $2`,
      [jobId, userId]
    );

    if (existingApplication.rows.length > 0) {
      throw new Error('You have already applied for this position');
    }

    const score = await generateRandomScore();

    const applicationResult = await client.query(
      `INSERT INTO "APP_JOB_APPLICATIONS" (
        job_id,
        applicant_id,
        status,
        score,
        created_at,
        updated_at
      ) VALUES ($1, $2, 'pending', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [jobId, userId, score]
    );

    const applicationId = applicationResult.rows[0].id;

    const { fileUrl: resumeUrl, fileName: resumeFileName } = 
      await saveApplicationDocument(resume, userId, 'resume');

    const { fileUrl: coverLetterUrl, fileName: coverLetterFileName } = 
      await saveApplicationDocument(coverLetter, userId, 'cover_letter');

    await client.query(
      `INSERT INTO "APP_JOB_APPLICATION_DOCUMENTS" (
        application_id,
        document_type,
        document_url,
        file_name,
        uploaded_at
      ) VALUES 
      ($1, 'resume', $2, $3, CURRENT_TIMESTAMP),
      ($1, 'cover_letter', $4, $5, CURRENT_TIMESTAMP)`,
      [
        applicationId,
        resumeUrl,
        resumeFileName,
        coverLetterUrl,
        coverLetterFileName
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status: 'pending',
        score
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { 
        status: error.message === 'Unauthorized' ? 401 : 
                error.message === 'Missing required fields' ? 400 :
                error.message === 'Profile incomplete' ? 400 :
                error.message === 'You have already applied for this position' ? 409 : 500 
      }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  const client = await pool.connect();
  
  try {
    const userId = await getUserId();

    const result = await client.query(
      `SELECT 
        a.id,
        a.job_id,
        a.status,
        a.score,
        a.created_at,
        a.updated_at,
        json_agg(json_build_object(
          'type', d.document_type,
          'url', d.document_url
        )) as documents
      FROM "APP_JOB_APPLICATIONS" a
      LEFT JOIN "APP_JOB_APPLICATION_DOCUMENTS" d ON a.id = d.application_id
      WHERE a.applicant_id = $1 AND a.is_active = true
      GROUP BY a.id
      ORDER BY a.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  const client = await pool.connect();
  
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { applicationId } = data;

    if (!applicationId) {
      throw new Error('Missing required fields');
    }

    await client.query('BEGIN');

    await client.query(
      `DELETE FROM "APP_JOB_APPLICATION_DOCUMENTS"
       WHERE application_id = $1`,
      [applicationId]
    );

    const result = await client.query(
      `DELETE FROM "APP_JOB_APPLICATIONS"
       WHERE id = $1 AND applicant_id = $2
       RETURNING id`,
      [applicationId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('Application not found or unauthorized');
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { 
        status: error.message === 'Unauthorized' ? 401 :
                error.message === 'Missing required fields' ? 400 :
                error.message === 'Application not found or unauthorized' ? 404 : 500
      }
    );
  } finally {
    client.release();
  }
}