import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

function validateUserData(data: any) {
  const requiredFields = ['email', 'password', 'first_name', 'last_name'];
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(data.email)) {
    throw new Error('Invalid email format');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (data.first_name.length < 2) {
    throw new Error('First name must be at least 2 characters long');
  }

  if (data.last_name.length < 2) {
    throw new Error('Last name must be at least 2 characters long');
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Set default role for new registrations
    data.role = 'APPLICANT';

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