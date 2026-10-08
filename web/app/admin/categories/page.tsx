import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Categories | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminCategoriesPage() {
  return <AdminScreen engine="adminCategories" />;
}
