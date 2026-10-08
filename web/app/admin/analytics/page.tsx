import type { Metadata } from "next";
import { AdminScreen, adminRobots } from "@/components/site/admin-screen";

export const metadata: Metadata = {
  title: "Analytics | Template Marketplace Admin",
  robots: adminRobots,
};

export default function AdminAnalyticsPage() {
  return <AdminScreen engine="adminAnalytics" />;
}
