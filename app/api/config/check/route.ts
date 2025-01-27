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

async function verifyAuth() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return session.user.id;
}

export async function GET() {
  try {
    await verifyAuth();

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM "CONFIG_departments" WHERE is_active = true) as departments_count,
        (SELECT COUNT(*) FROM "CONFIG_education_levels" WHERE is_active = true) as education_levels_count,
        (SELECT COUNT(*) FROM "CONFIG_employment_types" WHERE is_active = true) as employment_types_count,
        (SELECT COUNT(*) FROM "CONFIG_experience_levels" WHERE is_active = true) as experience_levels_count,
        (SELECT COUNT(*) FROM "CONFIG_skill_categories" WHERE is_active = true) as skill_categories_count
    `;

    const result = await pool.query(query);
    const counts = result.rows[0];

    const emptyTables = [];
    if (parseInt(counts.departments_count) === 0) emptyTables.push('Departments');
    if (parseInt(counts.education_levels_count) === 0) emptyTables.push('Education Levels');
    if (parseInt(counts.employment_types_count) === 0) emptyTables.push('Employment Types');
    if (parseInt(counts.experience_levels_count) === 0) emptyTables.push('Experience Levels');
    if (parseInt(counts.skill_categories_count) === 0) emptyTables.push('Skill Categories');

    return NextResponse.json({
      success: true,
      isValid: emptyTables.length === 0,
      emptyTables
    });

  } catch (error: any) {
    console.error('Error checking configuration:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}