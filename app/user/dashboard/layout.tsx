import { PortalRouteLayout } from "@/components/portal-route-layout";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <PortalRouteLayout>{children}</PortalRouteLayout>;
}
