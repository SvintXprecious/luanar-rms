import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default async function Dashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/applicant/signin')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {session.user?.name} to hello world</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">You are logged in as {session.user?.email}</p>
          <p className="text-slate-600">Role: {session.user?.role}</p>
          <form action={async () => { 'use server'; await signOut(); }} className="mt-4">
            <Button type="submit" variant="outline">Sign Out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}