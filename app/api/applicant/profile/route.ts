import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from "@/auth";
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

interface Document {
  document_url: string;
  file_name: string;
  uploaded_at?: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  readonly email?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other';
  identificationDocuments?: {
    nationalId?: Document;
    passport?: Document;
  };
  education?: Array<{
    id?: string;
    degree?: string;
    school?: string;
    location?: string;
    graduationYear?: string;
    grade?: string;
    documents?: {
      transcript?: Document;
      certificate?: Document;
    };
  }>;
  experience?: Array<{
    id?: string;
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name?: string;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialUrl?: string;
  }>;
  skills?: string[];
}

type PostgresValue = string | number | boolean | Date | null;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

function validateProfileData(data: Partial<UserProfile>) {
  if (data.email !== undefined) {
    throw new Error('Email cannot be modified');
  }

  if (data.phone !== undefined && data.phone !== null) {
    if (data.phone && !/^\+?[\d\s-]{8,}$/.test(data.phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  if (data.dateOfBirth !== undefined && data.dateOfBirth !== null && data.dateOfBirth !== '') {
    const birthDate = new Date(data.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid date of birth format');
    }
    
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    
    if (birthDate > today || birthDate < minDate) {
      throw new Error('Date of birth is out of valid range');
    }
  }

  if (data.experience) {
    for (const exp of data.experience) {
      if (exp.startDate && exp.endDate) {
        if (new Date(exp.startDate) > new Date(exp.endDate)) {
          throw new Error('Experience end date must be after start date');
        }
      }
    }
  }

  if (data.certifications) {
    for (const cert of data.certifications) {
      if (cert.issueDate && cert.expiryDate) {
        if (new Date(cert.issueDate) > new Date(cert.expiryDate)) {
          throw new Error('Certification expiry date must be after issue date');
        }
      }
    }
  }
}

async function getUserProfile(userId: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const profileResult = await client.query(
      `SELECT 
        u.first_name, 
        u.last_name, 
        u.email,
        up.middle_name, 
        up.phone, 
        TO_CHAR(up.date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        up.gender
       FROM users u
       LEFT JOIN APP_USER_PROFILES up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const educationResult = await client.query(
      `SELECT e.*, 
        (
          SELECT jsonb_object_agg(
            d.document_type,
            jsonb_build_object(
              'document_url', d.document_url,
              'file_name', d.file_name,
              'uploaded_at', d.uploaded_at
            )
          )
          FROM APP_USER_EDUCATION_DOCUMENTS d
          WHERE d.education_id = e.id
        ) as documents
       FROM APP_USER_EDUCATION e
       WHERE e.user_id = $1
       ORDER BY e.graduation_year DESC NULLS LAST`,
      [userId]
    );

    const experienceResult = await client.query(
      `SELECT 
        id,
        title,
        company,
        location,
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
        description
       FROM APP_USER_EXPERIENCE
       WHERE user_id = $1
       ORDER BY COALESCE(end_date, CURRENT_DATE) DESC, start_date DESC`,
      [userId]
    );

    const certificationsResult = await client.query(
      `SELECT 
        id,
        name,
        issuer,
        TO_CHAR(issue_date, 'YYYY-MM-DD') as issue_date,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') as expiry_date,
        credential_url
       FROM APP_USER_CERTIFICATIONS
       WHERE user_id = $1
       ORDER BY COALESCE(expiry_date, CURRENT_DATE) DESC, issue_date DESC`,
      [userId]
    );

    const documentsResult = await client.query(
      `SELECT document_type, document_url, file_name, uploaded_at
       FROM APP_USER_IDENTIFICATION_DOCUMENTS
       WHERE user_id = $1`,
      [userId]
    );

    const skillsResult = await client.query(
      `SELECT s.name
       FROM APP_USER_SKILLS us
       JOIN APP_SKILLS s ON us.skill_id = s.id
       WHERE us.user_id = $1
       ORDER BY s.name`,
      [userId]
    );

    await client.query('COMMIT');

    return {
      ...profileResult.rows[0],
      education: educationResult.rows,
      experience: experienceResult.rows,
      certifications: certificationsResult.rows,
      identificationDocuments: documentsResult.rows.reduce((acc, doc) => ({
        ...acc,
        [doc.document_type]: {
          document_url: doc.document_url,
          file_name: doc.file_name,
          uploaded_at: doc.uploaded_at
        }
      }), {}),
      skills: skillsResult.rows.map(row => row.name)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const userUpdateFields: string[] = [];
    const userUpdateValues: PostgresValue[] = [];
    let paramCounter = 1;

    if (data.firstName !== undefined) {
      userUpdateFields.push(`first_name = $${paramCounter}`);
      userUpdateValues.push(data.firstName);
      paramCounter++;
    }
    if (data.lastName !== undefined) {
      userUpdateFields.push(`last_name = $${paramCounter}`);
      userUpdateValues.push(data.lastName);
      paramCounter++;
    }

    if (userUpdateFields.length > 0) {
      userUpdateValues.push(userId);
      await client.query(
        `UPDATE users 
         SET ${userUpdateFields.join(', ')}
         WHERE id = $${paramCounter}`,
        userUpdateValues
      );
    }

    const profileFields: string[] = ['user_id'];
    const profileValues: PostgresValue[] = [userId];
    const profileUpdateFields: string[] = [];
    let profileParamCounter = 2;

    if (data.middleName !== undefined) {
      profileFields.push('middle_name');
      profileValues.push(data.middleName);
      profileUpdateFields.push(`middle_name = $${profileParamCounter}`);
      profileParamCounter++;
    }
    if (data.phone !== undefined) {
      profileFields.push('phone');
      profileValues.push(data.phone);
      profileUpdateFields.push(`phone = $${profileParamCounter}`);
      profileParamCounter++;
    }
    if (data.dateOfBirth !== undefined) {
      profileFields.push('date_of_birth');
      const dateValue = data.dateOfBirth === '' ? null : data.dateOfBirth;
      profileValues.push(dateValue);
      profileUpdateFields.push(`date_of_birth = $${profileParamCounter}`);
      profileParamCounter++;
    }
    if (data.gender !== undefined) {
      profileFields.push('gender');
      profileValues.push(data.gender);
      profileUpdateFields.push(`gender = $${profileParamCounter}`);
      profileParamCounter++;
    }

    if (profileFields.length > 1) {
      await client.query(
        `INSERT INTO APP_USER_PROFILES (${profileFields.join(', ')})
         VALUES (${profileFields.map((_, i) => `$${i + 1}`).join(', ')})
         ON CONFLICT (user_id) 
         DO UPDATE SET ${profileUpdateFields.join(', ')}`,
        profileValues
      );
    }

    if (data.education) {
      const keepIds = data.education
        .filter(edu => edu.id)
        .map(edu => edu.id);
      
      if (keepIds.length > 0) {
        await client.query(
          `DELETE FROM APP_USER_EDUCATION 
           WHERE user_id = $1 AND id NOT IN (${keepIds.map((_, i) => `$${i + 2}`).join(',')})`,
          [userId, ...keepIds]
        );
      } else {
        await client.query(
          `DELETE FROM APP_USER_EDUCATION WHERE user_id = $1`,
          [userId]
        );
      }

      for (const edu of data.education) {
        if (edu.id) {
          await client.query(
            `UPDATE APP_USER_EDUCATION 
             SET degree = $1, school = $2, location = $3,
                 graduation_year = $4, grade = $5
             WHERE id = $6 AND user_id = $7`,
            [edu.degree, edu.school, edu.location, edu.graduationYear,
             edu.grade, edu.id, userId]
          );
        } else if (Object.values(edu).some(v => v !== undefined)) {
          await client.query(
            `INSERT INTO APP_USER_EDUCATION (
              user_id, degree, school, location, graduation_year, grade
             ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, edu.degree, edu.school, edu.location,
             edu.graduationYear, edu.grade]
          );
        }
      }
    }

    if (data.experience) {
      const keepIds = data.experience
        .filter(exp => exp.id)
        .map(exp => exp.id);
      
      if (keepIds.length > 0) {
        await client.query(
          `DELETE FROM APP_USER_EXPERIENCE 
           WHERE user_id = $1 AND id NOT IN (${keepIds.map((_, i) => `$${i + 2}`).join(',')})`,
          [userId, ...keepIds]
        );
      } else {
        await client.query(
          `DELETE FROM APP_USER_EXPERIENCE WHERE user_id = $1`,
          [userId]
        );
      }

      for (const exp of data.experience) {
        const formattedStartDate = exp.startDate ? `${exp.startDate}-01` : null;
        const formattedEndDate = exp.endDate ? `${exp.endDate}-01` : null;

        if (exp.id) {
          await client.query(
            `UPDATE APP_USER_EXPERIENCE 
             SET title = $1, company = $2, location = $3,
                 start_date = $4, end_date = $5, description = $6
             WHERE id = $7 AND user_id = $8`,
            [exp.title, exp.company, exp.location, formattedStartDate,
             formattedEndDate, exp.description, exp.id, userId]
          );
        } else if (Object.values(exp).some(v => v !== undefined)) {
          await client.query(
            `INSERT INTO APP_USER_EXPERIENCE (
              user_id, title, company, location,
              start_date, end_date, description
             ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, exp.title, exp.company, exp.location,
             formattedStartDate, formattedEndDate, exp.description]
          );
        }
      }
    }

    if (data.certifications) {
      const keepIds = data.certifications
        .filter(cert => cert.id)
        .map(cert => cert.id);
      
      if (keepIds.length > 0) {
        await client.query(
          `DELETE FROM APP_USER_CERTIFICATIONS 
           WHERE user_id = $1 AND id NOT IN (${keepIds.map((_, i) => `$${i + 2}`).join(',')})`,
          [userId, ...keepIds]
        );
      } else {
        await client.query(
          `DELETE FROM APP_USER_CERTIFICATIONS WHERE user_id = $1`,
          [userId]
        );
      }

      for (const cert of data.certifications) {
        const formattedIssueDate = cert.issueDate ? `${cert.issueDate}-01` : null;
        const formattedExpiryDate = cert.expiryDate ? `${cert.expiryDate}-01` : null;

        if (cert.id) {
          await client.query(
            `UPDATE APP_USER_CERTIFICATIONS 
             SET name = $1, issuer = $2, issue_date = $3,
                 expiry_date = $4, credential_url = $5
             WHERE id = $6 AND user_id = $7`,
            [cert.name, cert.issuer, formattedIssueDate, formattedExpiryDate,
             cert.credentialUrl, cert.id, userId]
          );
        } else if (Object.values(cert).some(v => v !== undefined)) {
          await client.query(
            `INSERT INTO APP_USER_CERTIFICATIONS (
              user_id, name, issuer, issue_date,
              expiry_date, credential_url
             ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, cert.name, cert.issuer, formattedIssueDate,
             formattedExpiryDate, cert.credentialUrl]
          );
        }
      }
    }

    if (data.skills !== undefined) {
      await client.query(
        `DELETE FROM APP_USER_SKILLS WHERE user_id = $1`,
        [userId]
      );

      if (data.skills && data.skills.length > 0) {
        for (const skillName of data.skills) {
          const skillResult = await client.query(
            `INSERT INTO APP_SKILLS (name)
             VALUES ($1)
             ON CONFLICT (name) DO UPDATE 
             SET name = EXCLUDED.name
             RETURNING id`,
            [skillName]
          );

          await client.query(
            `INSERT INTO APP_USER_SKILLS (user_id, skill_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [userId, skillResult.rows[0].id]
          );
        }
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function saveUploadedFile(file: File, userId: string, section: string): Promise<{ fileUrl: string; fileName: string }> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', userId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const uniqueFilename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadsDir, uniqueFilename);
  const fileUrl = `/uploads/${userId}/${uniqueFilename}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  return {
    fileUrl,
    fileName: file.name
  };
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const profile = await getUserProfile(userId);
    
    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { 
        status: error.message === 'Unauthorized' ? 401 : 500 
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data: Partial<UserProfile> = await request.json();

    // Ensure email is not being modified
    if (data.email !== undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email cannot be modified'
        },
        { status: 400 }
      );
    }

    validateProfileData(data);
    await updateUserProfile(userId, data);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { 
        status: error.message === 'Unauthorized' ? 401 : 500 
      }
    );
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const userId = await getUserId();
    const data = await request.formData();
    const file = data.get('file') as File;
    const section = data.get('section') as string;
    const field = JSON.parse(data.get('field') as string);

    if (!file) {
      throw new Error('No file provided');
    }

    const { fileUrl, fileName } = await saveUploadedFile(file, userId, section);

    try {
      await client.query('BEGIN');

      if (section === 'identification') {
        // First delete existing document of this type
        await client.query(
          `DELETE FROM APP_USER_IDENTIFICATION_DOCUMENTS 
           WHERE user_id = $1 AND document_type = $2`,
          [userId, field]
        );
        
        // Then insert new document
        await client.query(
          `INSERT INTO APP_USER_IDENTIFICATION_DOCUMENTS 
           (user_id, document_type, document_url, file_name, uploaded_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [userId, field, fileUrl, fileName]
        );
      } else if (section === 'education') {
        // First delete existing document of this type
        await client.query(
          `DELETE FROM APP_USER_EDUCATION_DOCUMENTS 
           WHERE education_id = $1 AND document_type = $2`,
          [field.educationId, field.type]
        );
        
        // Then insert new document
        await client.query(
          `INSERT INTO APP_USER_EDUCATION_DOCUMENTS 
           (education_id, document_type, document_url, file_name, uploaded_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [field.educationId, field.type, fileUrl, fileName]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        fileUrl,
        fileName
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { 
        status: error.message === 'Unauthorized' ? 401 : 500 
      }
    );
  } finally {
    client.release();
  }
}