// app/api/jobs/search/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const departmentId = searchParams.get('department_id');
    const employmentTypeId = searchParams.get('employment_type_id');
    const search = searchParams.get('search');
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause dynamically
    let whereConditions = ['j.is_active = true'];
    let params = [];
    let paramCount = 1;
    
    if (departmentId) {
      whereConditions.push(`j.department_id = $${paramCount}`);
      params.push(departmentId);
      paramCount++;
    }
    
    if (employmentTypeId) {
      whereConditions.push(`j.employment_type_id = $${paramCount}`);
      params.push(employmentTypeId);
      paramCount++;
    }
    
    if (search) {
      whereConditions.push(`(
        LOWER(j.title) LIKE LOWER($${paramCount}) OR 
        LOWER(j.description) LIKE LOWER($${paramCount}) OR
        LOWER(d.name) LIKE LOWER($${paramCount})
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }
    
    // Construct the final WHERE clause
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM jobs j
      LEFT JOIN "CONFIG_departments" d ON j.department_id = d.id
      ${whereClause}
    `;
    
    // Get filtered jobs
    const jobsQuery = `
      SELECT 
        j.*,
        d.name as department_name,
        et.name as employment_type_name
      FROM jobs j
      LEFT JOIN "CONFIG_departments" d ON j.department_id = d.id
      LEFT JOIN "CONFIG_employment_types" et ON j.employment_type_id = et.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    // Add limit and offset to params
    params.push(limit, offset);
    
    // Execute both queries in parallel
    const [countResult, jobsResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, -2)), // Exclude limit/offset params
      pool.query(jobsQuery, params)
    ]);
    
    return NextResponse.json({
      success: true,
      data: jobsResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    });

  } catch (error: any) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}