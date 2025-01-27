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
  if (!session) throw new Error('Unauthorized');
  
  if (session.user.role !== 'HR') {
    throw new Error('Forbidden');
  }
  
  return session.user.id;
}

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, level_id, label, year_range, is_active 
       FROM "CONFIG_experience_levels" 
       ORDER BY label ASC`
    );

    return NextResponse.json({
      success: true,
      experience_levels: result.rows
    });

  } catch (error) {
    console.error('Error fetching experience levels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await verifyHRRole();
    const { level_id, label, year_range } = await request.json();
    
    if (!level_id || !label || !year_range) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingLevel = await pool.query(
      `SELECT id, is_active 
       FROM "CONFIG_experience_levels" 
       WHERE LOWER(level_id) = LOWER($1)`,
      [level_id]
    );

    if (existingLevel.rows.length > 0) {
      if (existingLevel.rows[0].is_active) {
        return NextResponse.json(
          { error: 'Experience level ID already exists' },
          { status: 400 }
        );
      }
      
      const result = await pool.query(
        `UPDATE "CONFIG_experience_levels" 
         SET is_active = true, 
             label = $1, 
             year_range = $2
         WHERE id = $3
         RETURNING id, level_id, label, year_range, is_active`,
        [label, year_range, existingLevel.rows[0].id]
      );
      
      return NextResponse.json({
        success: true,
        experience_level: result.rows[0],
        message: `Experience level "${label}" reactivated successfully`
      });
    }

    const result = await pool.query(
      `INSERT INTO "CONFIG_experience_levels" 
       (level_id, label, year_range) 
       VALUES ($1, $2, $3) 
       RETURNING id, level_id, label, year_range, is_active`,
      [level_id, label, year_range]
    );

    return NextResponse.json({
      success: true,
      experience_level: result.rows[0],
      message: `Experience level "${label}" added successfully`
    });

  } catch (error: any) {
    console.error('Error creating experience level:', error);
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
    const { id, level_id, label, year_range, is_active } = await request.json();
    
    if (is_active !== undefined && !level_id && !label && !year_range) {
      const result = await pool.query(
        `UPDATE "CONFIG_experience_levels" 
         SET is_active = $1
         WHERE id = $2
         RETURNING id, level_id, label, year_range, is_active`,
        [is_active, id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Experience level not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        experience_level: result.rows[0],
        message: `Experience level "${result.rows[0].label}" ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    }

    if (level_id || label || year_range) {
      if (level_id) {
        const existingLevel = await pool.query(
          `SELECT id 
           FROM "CONFIG_experience_levels" 
           WHERE LOWER(level_id) = LOWER($1) AND id != $2`,
          [level_id, id]
        );

        if (existingLevel.rows.length > 0) {
          return NextResponse.json(
            { error: 'An experience level with this ID already exists' },
            { status: 400 }
          );
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (level_id) {
        updates.push(`level_id = $${paramCount}`);
        values.push(level_id);
        paramCount++;
      }
      if (label) {
        updates.push(`label = $${paramCount}`);
        values.push(label);
        paramCount++;
      }
      if (year_range) {
        updates.push(`year_range = $${paramCount}`);
        values.push(year_range);
        paramCount++;
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE "CONFIG_experience_levels" 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, level_id, label, year_range, is_active`,
        values
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Experience level not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        experience_level: result.rows[0],
        message: `Experience level updated successfully`
      });
    }

    return NextResponse.json(
      { error: 'Invalid update parameters' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error updating experience level:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}