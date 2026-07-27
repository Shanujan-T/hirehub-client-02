"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { GuestRoute } from "@/components/auth-guard";
import { Button, Input, Label, Select } from "@/components/ui";
import { registerSchema, type RegisterForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data);
      toast.success("Account created");
      router.push(getDashboardPath(JSON.parse(localStorage.getItem("user") || "{}")));
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <GuestRoute>
      <AuthLayout title="Create account" subtitle="Join as employer or skilled member">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select {...register("role")}><option value="user">User</option><option value="employer">Employer</option></Select>
          </div>
          <div className="space-y-2"><Label>Full Name</Label><Input {...register("full_name")} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" {...register("password")} /></div>
          <div className="space-y-2"><Label>Location</Label><Input {...register("location")} /></div>
          <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Creating..." : "Create Account"}</Button>
          <p className="text-center text-sm text-muted">Have an account? <Link href="/auth/login" className="font-semibold text-info">Sign in</Link></p>
        </form>
      </AuthLayout>
    </GuestRoute>
  );
}
