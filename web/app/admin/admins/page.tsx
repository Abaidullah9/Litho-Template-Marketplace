import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Admins | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminAdminsPage() {
  return <AdminScreen engine="adminAdmins" />;
}
