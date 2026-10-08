import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Publishers | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminPublishersPage() {
  return <AdminScreen engine="adminPublishers" />;
}
