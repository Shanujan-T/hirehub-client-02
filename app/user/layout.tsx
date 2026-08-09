import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalRouteLayout } from "@/components/portal-route-layout";

export default function UserPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalRouteLayout>{children}</PortalRouteLayout>
    </AuthenticatedRoute>
  );
}
