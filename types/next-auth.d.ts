import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      position: string
      isAdmin: boolean
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: string
    position: string
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: string
    position: string
    isAdmin: boolean
  }
}