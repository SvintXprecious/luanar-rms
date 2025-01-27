import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from "@/auth";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

// Define application status enum to match database
enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  REJECTED = 'rejected',
  OFFERED = 'offered',
  HIRED = 'hired'
}

type Applicant = {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  appliedDate: string;
  status: ApplicationStatus;
  fit: number;
  documents: Array<{
    type: string;
    url: string;
    fileName: string;
  }>;
}

async function verifyHRRole() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  if (session.user.role !== 'HR') {
    throw new Error('Forbidden');
  }
  return session.user.id;
}

export async function GET(request: Request) {
  const client = await pool.connect();
  
  try {
    await verifyHRRole();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
 
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
 
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json({ error: 'Invalid Job ID format' }, { status: 400 });
    }
 
    let query = `
      SELECT 
        ja.id as application_id,
        ja.created_at as applied_date,
        ja.status,
        ja.score,
        u.id as applicant_id,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'type', jad.document_type,
            'url', jad.document_url,
            'fileName', jad.file_name
          ))
          FROM "APP_JOB_APPLICATION_DOCUMENTS" jad 
          WHERE jad.application_id = ja.id
          ), '[]'
        ) as documents
      FROM "APP_JOB_APPLICATIONS" ja
      JOIN users u ON ja.applicant_id = u.id
      WHERE ja.job_id = $1 AND ja.is_active = true
    `;
 
    const queryParams = [jobId];
 
    if (status) {
      if (!Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      query += ` AND ja.status = $2`;
      queryParams.push(status);
    }
 
    query += ` ORDER BY ja.created_at DESC`;
 
    const result = await client.query(query, queryParams);
 
    const applicants = result.rows.map(row => ({
      id: row.applicant_id,
      applicationId: row.application_id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      appliedDate: row.applied_date,
      status: row.status,
      score: row.score,
      documents: row.documents
    }));
 
    return NextResponse.json({
      success: true,
      data: applicants
    });
 
  } catch (error: any) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  } finally {
    client.release();
  }
 }

// PATCH - Update application status
export async function PATCH(request: Request) {
  const client = await pool.connect();
  
  try {
    await verifyHRRole();
    const data = await request.json();
    const { applicationId, status } = data;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!status || !Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: ' + Object.values(ApplicationStatus).join(', ') },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Update application status
    const result = await client.query(
      `UPDATE "APP_JOB_APPLICATIONS"
       SET status = $1::application_status, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND is_active = true
       RETURNING id, status`,
      [status, applicationId]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Application not found or already inactive' },
        { status: 404 }
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `Application status updated to ${status}`
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating application status:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { 
        status: error.message === 'Unauthorized' ? 401 :
                error.message === 'Forbidden' ? 403 : 500 
      }
    );
  } finally {
    client.release();
  }
}