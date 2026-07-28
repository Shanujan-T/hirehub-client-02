import { PortalRouteLayout } from "@/components/portal-route-layout";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <PortalRouteLayout>{children}</PortalRouteLayout>;
}
