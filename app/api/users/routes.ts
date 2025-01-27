import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from "@/auth";
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

async function verifySession() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return session.user.id;
}

function validateUserData(data: any, isUpdate = false) {
  if (!isUpdate) {
    const requiredFields = ['email', 'password', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  if (data.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(data.email)) {
    throw new Error('Invalid email format');
  }

  if (data.password && data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (data.first_name && data.first_name.length < 2) {
    throw new Error('First name must be at least 2 characters long');
  }

  if (data.last_name && data.last_name.length < 2) {
    throw new Error('Last name must be at least 2 characters long');
  }
}

async function getUserById(userId: string) {
  const result = await pool.query(
    `SELECT id, email, first_name, last_name, role, created_at, updated_at
     FROM users 
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Set default role for new registrations
    data.role = 'USER';

    validateUserData(data);

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const result = await pool.query(
      `INSERT INTO users (
        email, password, first_name, last_name, role
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at`,
      [
        data.email,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.role
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

// Protected routes below - require session
export async function GET(request: Request) {
  try {
    await verifySession();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      const user = await getUserById(userId);
      return NextResponse.json({ success: true, data: user });
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, created_at, updated_at
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUserId = await verifySession();
    const { id, ...data } = await request.json();

    if (!id) {
      throw new Error('User ID is required');
    }

    // Only allow users to update their own profile unless they're an admin
    const session = await auth();
    if (session?.user.role !== 'ADMIN' && id !== currentUserId) {
      throw new Error('Forbidden: You can only update your own profile');
    }

    validateUserData(data, true);

    // If email is being updated, check for duplicates
    if (data.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [data.email, id]
      );

      if (emailCheck.rows.length > 0) {
        throw new Error('Email already exists');
      }
    }

    // If password is being updated, hash it
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && ['email', 'password', 'first_name', 'last_name', 'role'].includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, role, updated_at
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUserId = await verifySession();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Only allow admins to delete users
    const session = await auth();
    if (session?.user.role !== 'ADMIN') {
      throw new Error('Forbidden: Only administrators can delete users');
    }

    // Prevent self-deletion
    if (userId === currentUserId) {
      throw new Error('Cannot delete your own account');
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 
              error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}