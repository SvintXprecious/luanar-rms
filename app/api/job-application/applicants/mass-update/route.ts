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

async function verifyHRRole() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  if (session.user.role !== 'HR') {
    throw new Error('Forbidden');
  }
  return session.user.id;
}

export async function PATCH(request: Request) {
  const client = await pool.connect();
  
  try {
    await verifyHRRole();
    const data = await request.json();
    const { jobId, fromStatus, toStatus } = data;

    // Validate required fields
    if (!jobId || !fromStatus || !toStatus) {
      return NextResponse.json(
        { error: 'Job ID, fromStatus, and toStatus are required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        { error: 'Invalid Job ID format' },
        { status: 400 }
      );
    }

    // Validate status values
    if (!Object.values(ApplicationStatus).includes(fromStatus as ApplicationStatus) || 
        !Object.values(ApplicationStatus).includes(toStatus as ApplicationStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: ' + Object.values(ApplicationStatus).join(', ') },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Update all matching applications
    const result = await client.query(
      `UPDATE "APP_JOB_APPLICATIONS"
       SET 
         status = $1::application_status,
         updated_at = CURRENT_TIMESTAMP
       WHERE 
         job_id = $2 
         AND status = $3::application_status
         AND is_active = true
       RETURNING id, status`,
      [toStatus, jobId, fromStatus]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'No matching applications found' },
        { status: 404 }
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.rowCount,
        updatedApplications: result.rows
      },
      message: `Successfully updated ${result.rowCount} applications from ${fromStatus} to ${toStatus}`
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating applications:', error);
    
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