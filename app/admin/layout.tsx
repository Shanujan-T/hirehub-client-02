export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-portal-root flex min-h-screen flex-1 flex-col">{children}</div>;
}