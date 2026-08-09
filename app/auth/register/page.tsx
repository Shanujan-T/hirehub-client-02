"use client";



import Link from "next/link";

import { Suspense } from "react";

import { Briefcase, HardHat } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") === "employer" ? "employer" : "user";

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: requestedRole },
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
    <AuthLayout title="Create account" subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-border p-3 transition-colors hover:border-[#007ACD]/70 has-[:checked]:border-[#4D2BD8] has-[:checked]:bg-[#4D2BD8]/5">
              <input type="radio" value="user" className="mr-2" {...register("role")} />
              <Briefcase className="mr-1.5 inline h-4 w-4 text-[#08308B] dark:text-[#007ACD]" aria-hidden />
              <span className="font-semibold">User</span>
              <span className="mt-1 block text-xs text-muted">Post jobs for communities to bid on</span>
            </label>
            <label className="cursor-pointer rounded-xl border border-border p-3 transition-colors hover:border-[#7D07DB]/70 has-[:checked]:border-[#7D07DB] has-[:checked]:bg-[#7D07DB]/5">
              <input type="radio" value="employer" className="mr-2" {...register("role")} />
              <HardHat className="mr-1.5 inline h-4 w-4 text-[#4D2BD8] dark:text-[#7D07DB]" aria-hidden />
              <span className="font-semibold">Employer</span>
              <span className="mt-1 block text-xs text-muted">Join a community and do contracted work</span>
            </label>
          </div>
          <p className="text-xs font-medium text-[#4D2BD8] dark:text-[#7D07DB]">
            This choice is permanent — you can&apos;t switch account types later.
          </p>
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </fieldset>
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
          <p className="text-xs text-muted">At least 6 characters</p>
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

      <Suspense fallback={<AuthLayout title="Create account" subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully."><p className="text-center text-sm text-muted">Loading...</p></AuthLayout>}>

        <RegisterForm />

      </Suspense>

    </GuestRoute>

  );

}

