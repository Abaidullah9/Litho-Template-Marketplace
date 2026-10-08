import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Registry | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminRegistryPage() {
  return <AdminScreen engine="adminRegistry" />;
}
