import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432')
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          // Log the role being passed
          console.log("Role:", credentials.role);

          // Use parameterized query to prevent SQL injection
          const query = `
            SELECT 
              u.*,
              CASE 
                WHEN u.role = 'HR' THEN hp.position 
                ELSE NULL 
              END as position,
              CASE 
                WHEN u.role = 'HR' THEN hp.is_admin 
                ELSE FALSE 
              END as is_admin
            FROM users u
            LEFT JOIN hr_profiles hp ON u.id = hp.user_id AND u.role = 'HR'
            WHERE u.email = $1
          `;

          const result = await pool.query(query, [credentials.email]);

          if (!result.rows[0]) {
            console.log("User not found");
            return null;
          }

          const user = result.rows[0];
          console.log("Found user:", { ...user, password: '[REDACTED]' });

          if (user.role !== credentials.role) {
            console.log("Role mismatch");
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            console.log("Password mismatch");
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            position: user.position,
            isAdmin: user.is_admin
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development'
})