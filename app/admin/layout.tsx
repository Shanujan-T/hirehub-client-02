import { PortalRouteLayout } from "@/components/portal-route-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalRouteLayout className="admin-portal-root">{children}</PortalRouteLayout>;
}
