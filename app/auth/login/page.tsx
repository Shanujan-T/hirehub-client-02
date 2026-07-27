"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth-guard";
import { Button, Input, Label } from "@/components/ui";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";
import { getMyMemberships } from "@/services/community";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Logged in");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let isCommunityAdmin = false;
      if (user.role === "user") {
        const memberships = await getMyMemberships();
        isCommunityAdmin = memberships.some(
          (m) => m.role === "admin" && m.status === "approved"
        );
      }
      router.push(getDashboardPath(user, isCommunityAdmin));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Login</h1>
          <p className="text-muted">Sign in to your LocalJobFinder account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </GuestRoute>
  );
}
