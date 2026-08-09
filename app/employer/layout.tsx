import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalRouteLayout } from "@/components/portal-route-layout";

export default function EmployerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalRouteLayout>{children}</PortalRouteLayout>
    </AuthenticatedRoute>
  );
}
