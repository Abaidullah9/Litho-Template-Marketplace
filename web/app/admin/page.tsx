import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Dashboard | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminDashboardPage() {
  return <AdminScreen engine="adminDashboard" />;
}
