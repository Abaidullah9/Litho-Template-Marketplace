import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Templates | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminTemplatesPage() {
  return <AdminScreen engine="adminTemplates" />;
}
