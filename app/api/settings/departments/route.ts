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

function formatDepartmentName(name: string): string {
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Verify user has a valid session
async function verifySession() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return session.user;
}

// For HR-only operations
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
      `SELECT id, name, is_active 
       FROM "CONFIG_departments" 
       ORDER BY is_active DESC, name ASC`
    );

    return NextResponse.json({
      success: true,
      departments: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Strictly verify HR role for POST operations
    await verifyHRRole();
    const { name } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const formattedName = formatDepartmentName(name);
    const existingDept = await pool.query(
      `SELECT id, is_active, name 
       FROM "CONFIG_departments" 
       WHERE LOWER(name) = LOWER($1)`,
      [formattedName]
    );

    if (existingDept.rows.length > 0) {
      if (existingDept.rows[0].is_active) {
        return NextResponse.json(
          { error: 'Department already exists' },
          { status: 400 }
        );
      }
      
      const result = await pool.query(
        `UPDATE "CONFIG_departments" 
         SET is_active = true, name = $1
         WHERE id = $2
         RETURNING id, name, is_active`,
        [formattedName, existingDept.rows[0].id]
      );
      
      return NextResponse.json({
        success: true,
        department: result.rows[0],
        message: `Department "${formattedName}" reactivated successfully`
      });
    }

    const result = await pool.query(
      `INSERT INTO "CONFIG_departments" (name) 
       VALUES ($1) 
       RETURNING id, name, is_active`,
      [formattedName]
    );

    return NextResponse.json({
      success: true,
      department: result.rows[0],
      message: `Department "${formattedName}" added successfully`
    });

  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Strictly verify HR role for PUT operations
    await verifyHRRole();
    const { id, name, is_active } = await request.json();
    
    if (is_active !== undefined && !name) {
      const result = await pool.query(
        `UPDATE "CONFIG_departments" 
         SET is_active = $1
         WHERE id = $2
         RETURNING id, name, is_active`,
        [is_active, id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        department: result.rows[0],
        message: `Department "${result.rows[0].name}" ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    }

    if (name) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Department name cannot be empty' },
          { status: 400 }
        );
      }

      const formattedName = formatDepartmentName(name);
      const existingDept = await pool.query(
        `SELECT id 
         FROM "CONFIG_departments" 
         WHERE LOWER(name) = LOWER($1) AND id != $2`,
        [formattedName, id]
      );

      if (existingDept.rows.length > 0) {
        return NextResponse.json(
          { error: 'A department with this name already exists' },
          { status: 400 }
        );
      }

      const result = await pool.query(
        `UPDATE "CONFIG_departments" 
         SET name = $1
         WHERE id = $2
         RETURNING id, name, is_active`,
        [formattedName, id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        department: result.rows[0],
        message: `Department name updated to "${formattedName}" successfully`
      });
    }

    return NextResponse.json(
      { error: 'Invalid update parameters' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}