// page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CareerDashboard from "./components/CareerDashboard";


export default async function ProtectedCareerDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/applicant/signin');
  }

  return <CareerDashboard session={session} />;
}
