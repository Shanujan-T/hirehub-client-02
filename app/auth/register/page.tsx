"use client";



import Link from "next/link";

import { Suspense } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { notify } from "@/lib/notify";

import { AuthLayout } from "@/components/auth-layout";

import { GuestRoute } from "@/components/auth-guard";

import { Button, Input, Label, PasswordInput } from "@/components/ui";

import { registerSchema, type RegisterForm } from "@/lib/schemas";

import { getErrorMessage } from "@/lib/utils";

import { useAuth, getDashboardPath } from "@/providers/auth-provider";



function RegisterForm() {
  const { register: authRegister } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data);
      notify.success("Account created");
      router.push(getDashboardPath(JSON.parse(localStorage.getItem("user") || "{}")));
    } catch (err) {
      notify.error(getErrorMessage(err, "Registration failed"));
    }
  };


  return (
    <AuthLayout title="Create account" subtitle="One account — post jobs, join communities, or both">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <PasswordInput id="register-password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Creating..." : "Create Account"}</Button>

        <p className="text-center text-sm text-muted">Already have an account? <Link href="/auth/login" className="font-semibold text-info">Log in</Link></p>
      </form>
    </AuthLayout>


  );

}



export default function RegisterPage() {

  return (

    <GuestRoute>

      <Suspense fallback={<AuthLayout title="Create account" subtitle="One account — post jobs, join communities, or both"><p className="text-center text-sm text-muted">Loading...</p></AuthLayout>}>

        <RegisterForm />

      </Suspense>

    </GuestRoute>

  );

}

