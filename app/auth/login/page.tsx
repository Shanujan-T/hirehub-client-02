"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/lib/notify";
import { getReturnToParam } from "@/lib/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { GuestRoute } from "@/components/auth-guard";
import { Button, Input, Label, PasswordInput } from "@/components/ui";
import { loginSchema, type LoginForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";
import { getMyMemberships } from "@/services/community";

function LoginFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      notify.success("Logged in");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const returnTo = getReturnToParam(searchParams, "");
      if (returnTo) {
        router.push(returnTo);
        return;
      }
      let isCommunityAdmin = false;
      if (user.role === "user") {
        const memberships = await getMyMemberships();
        isCommunityAdmin = memberships.some((m) => m.role === "admin" && m.status === "approved");
      }
      router.push(getDashboardPath(user, isCommunityAdmin));
    } catch (err) {
      notify.error(getErrorMessage(err, "Login failed"));
    }
  };

  return (
    <GuestRoute>
      <AuthLayout title="Welcome back" subtitle="Sign in to HireHub">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          <div className="space-y-2"><Label htmlFor="login-password">Password</Label><PasswordInput id="login-password" autoComplete="current-password" {...register("password")} /></div>
          <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Signing in..." : "Sign In"}</Button>
          <p className="text-center text-sm text-muted">Don&apos;t have an account? <Link href="/auth/register" className="font-semibold text-info">Sign up</Link></p>
        </form>
      </AuthLayout>
    </GuestRoute>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}
