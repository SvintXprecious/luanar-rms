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

    const [
      departmentsResult,
      educationLevelsResult,
      employmentTypesResult,
      experienceLevelsResult,
      skillCategoriesResult
    ] = await Promise.all([
      pool.query(`
        SELECT id, name
        FROM "CONFIG_departments"
        WHERE is_active = true
        ORDER BY name
      `),
      
      pool.query(`
        SELECT id, name
        FROM "CONFIG_education_levels"
        WHERE is_active = true
      `),
      
      pool.query(`
        SELECT id, name
        FROM "CONFIG_employment_types"
        WHERE is_active = true
      `),
      
      pool.query(`
        SELECT id, level_id, label, year_range
        FROM "CONFIG_experience_levels"
        WHERE is_active = true
      `),
      
      pool.query(`
        SELECT id, name
        FROM "CONFIG_skill_categories"
        WHERE is_active = true
      `)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentsResult.rows,
        educationLevels: educationLevelsResult.rows,
        employmentTypes: employmentTypesResult.rows,
        experienceLevels: experienceLevelsResult.rows,
        skillCategories: skillCategoriesResult.rows
      }
    });

  } catch (error: any) {
    console.error('Error fetching configuration data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}