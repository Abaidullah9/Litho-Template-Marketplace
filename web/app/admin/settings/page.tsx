import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Settings | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminSettingsPage() {
  return <AdminScreen engine="adminSettings" />;
}
