import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RecruitDashboard from "./components/RecruitDashboard";

export default async function ProtectedRecruitDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/recruit/signin');
  }

  return <RecruitDashboard session={session} />;
}