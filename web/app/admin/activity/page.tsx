import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Activity log | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminActivityPage() {
  return <AdminScreen engine="adminActivity" />;
}
