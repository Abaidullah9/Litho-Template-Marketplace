import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Tags | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminTagsPage() {
  return <AdminScreen engine="adminTags" />;
}
