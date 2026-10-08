import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Template editor | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminTemplateFormPage() {
  return <AdminScreen engine="adminTemplateForm" />;
}
