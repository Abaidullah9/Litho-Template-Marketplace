import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Submissions | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminSubmissionsPage() {
  return <AdminScreen engine="adminSubmissions" />;
}
