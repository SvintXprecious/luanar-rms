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

async function verifyHRRole() {
  const session = await auth();
  console.log('Session:', session);
  if (!session) throw new Error('Unauthorized');
  console.log('User role:', session.user.role);
  
  if (session.user.role !== 'HR') {
    throw new Error('Forbidden');
  }
  
  return session.user.id;
}

function validateJobData(data: any) {
  const requiredFields = [
    'title', 'department_id', 'employment_type_id', 'closing_date',
    'description', 'responsibilities', 'education_level_id',
    'experience_level_id', 'skills', 'qualifications', 'termsAndConditions'
  ];

  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (new Date(data.closing_date) <= new Date()) {
    throw new Error('Closing date must be in the future');
  }

  if (data.description.length < 100) {
    throw new Error('Description must be at least 100 characters');
  }

  if (!Array.isArray(data.responsibilities) || data.responsibilities.length === 0) {
    throw new Error('At least one responsibility is required');
  }

  if (!Array.isArray(data.qualifications) || data.qualifications.length === 0) {
    throw new Error('At least one qualification is required');
  }

  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    throw new Error('At least one skill is required');
  }

  if (data.termsAndConditions.length < 50) {
    throw new Error('Terms and conditions must be at least 50 characters');
  }
}

async function getJobById(jobId: string) {
  const result = await pool.query(
    `SELECT j.*,
            d.name as department_name,
            et.name as employment_type_name,
            el.name as education_level_name,
            exl.label as experience_level_label,
            exl.year_range as experience_year_range,
            CONCAT(u.first_name, ' ', u.last_name) as posted_by_name
     FROM jobs j
     LEFT JOIN "CONFIG_departments" d ON j.department_id = d.id
     LEFT JOIN "CONFIG_employment_types" et ON j.employment_type_id = et.id
     LEFT JOIN "CONFIG_education_levels" el ON j.education_level_id = el.id
     LEFT JOIN "CONFIG_experience_levels" exl ON j.experience_level_id = exl.id
     LEFT JOIN users u ON j.posted_by = u.id
     WHERE j.id = $1 AND j.is_active = true`,
    [jobId]
  );

  if (result.rows.length === 0) {
    throw new Error('Job posting not found');
  }

  return result.rows[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    const counts = searchParams.get('counts');

    if (counts === 'true') {
      const jobCounts = await pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE is_active = true) as active_jobs,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_jobs,
          COUNT(*) as total_jobs
         FROM jobs`
      );
      return NextResponse.json({ success: true, data: jobCounts.rows[0] });
    }

    if (jobId) {
      const job = await getJobById(jobId);
      return NextResponse.json({ success: true, data: job });
    }

    const result = await pool.query(
      `SELECT j.*,
              d.name as department_name,
              et.name as employment_type_name
       FROM jobs j
       LEFT JOIN "CONFIG_departments" d ON j.department_id = d.id
       LEFT JOIN "CONFIG_employment_types" et ON j.employment_type_id = et.id
       WHERE j.is_active = true
       ORDER BY j.created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });

  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyHRRole();
    const data = await request.json();

    validateJobData(data);

    const result = await pool.query(
      `INSERT INTO jobs (
        title, department_id, location, employment_type_id, 
        closing_date, description, responsibilities, education_level_id,
        experience_level_id, skills, qualifications, terms_and_conditions,
        additional_information, posted_by
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id`,
      [
        data.title,
        data.department_id,
        'Lilongwe, Malawi',
        data.employment_type_id,
        new Date(data.closing_date).toISOString().split('T')[0], 
        data.description,
        data.responsibilities,
        data.education_level_id,
        data.experience_level_id,
        [JSON.stringify(data.skills)],
        data.qualifications,
        data.termsAndConditions,
        data.additionalInformation || null,
        userId
      ]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Job posting created successfully'
    });

  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await verifyHRRole();
    const { id, ...data } = await request.json();

    if (!id) {
      throw new Error('Job ID is required');
    }

    validateJobData(data);

    const result = await pool.query(
      `UPDATE jobs 
       SET title = $1,
           department_id = $2,
           employment_type_id = $3,
           closing_date = $4,
           description = $5,
           responsibilities = $6,
           education_level_id = $7,
           experience_level_id = $8,
           skills = $9,
           qualifications = $10,
           terms_and_conditions = $11,
           additional_information = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND is_active = true
       RETURNING id`,
      [
        data.title,
        data.department_id,
        data.employment_type_id,
        new Date(data.closing_date).toISOString().split('T')[0], 
        data.description,
        data.responsibilities,
        data.education_level_id,
        data.experience_level_id,
        JSON.stringify(data.skills),
        data.qualifications,
        data.termsAndConditions,
        data.additionalInformation || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      throw new Error('Job posting not found');
    }

    return NextResponse.json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Job posting updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyHRRole();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const result = await pool.query(
      `UPDATE jobs 
       SET is_active = false, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_active = true
       RETURNING id`,
      [jobId]
    );

    if (result.rowCount === 0) {
      throw new Error('Job posting not found');
    }

    return NextResponse.json({
      success: true,
      message: 'Job posting deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}