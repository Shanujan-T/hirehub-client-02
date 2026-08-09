"use client";



import Link from "next/link";

import Image from "next/image";

import axios from "axios";

import { Suspense, useState } from "react";

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

function RoleContextPanel({ role }: { role: "user" | "employer" }) {
  if (role === "user") {
    return (
      <div className="relative h-full min-h-[640px]">
        <div className="absolute -inset-10">
          <Image
            src="/images/register-user-role.png"
            alt="Post jobs, get real work done — job posting features"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 0px"
            className="object-cover dark:hidden"
          />
          <Image
            src="/images/register-user-role-dark.png"
            alt="Post jobs, get real work done — job posting features"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 0px"
            className="hidden object-cover dark:block"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[640px]">
      <div className="absolute -inset-10">
        <Image
          src="/images/register-employer-role.png"
          alt="Join a community, do the work — employer account features"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 0px"
          className="object-cover dark:hidden"
        />
        <Image
          src="/images/register-employer-role-dark.png"
          alt="Join a community, do the work — employer account features"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 0px"
          className="hidden object-cover dark:block"
        />
      </div>
    </div>
  );
}



function RegisterForm() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<{ message: string; emailConflict: boolean } | null>(null);
  const requestedRole = searchParams.get("role") === "employer" ? "employer" : "user";

  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: requestedRole },
  });
  const selectedRole = watch("role", requestedRole);

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    try {
      const user = await authRegister(data);
      notify.success("Account created");
      const dashboardPath =
        user.role === "user"
          ? "/user/dashboard"
          : user.role === "employer"
            ? "/employer/dashboard"
            : getDashboardPath(user);
      router.replace(dashboardPath);
    } catch (err) {
      const emailConflict = axios.isAxiosError(err) && err.response?.status === 409;
      const message = emailConflict
        ? "An account with this email already exists. Try logging in instead."
        : getErrorMessage(err, "Registration failed. Please try again.");
      setSubmitError({ message, emailConflict });
      notify.error(message);
    }
  };


  return (
    <AuthLayout
      title="Create account"
      subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully."
      aside={<RoleContextPanel role={selectedRole} />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-border p-2.5 transition-colors hover:border-[#007ACD]/70 md:p-3 has-[:checked]:border-[#4D2BD8] has-[:checked]:bg-[#4D2BD8]/5">
              <input type="radio" value="user" className="mr-2" {...register("role")} />
              <Briefcase className="mr-1.5 inline h-4 w-4 text-[#08308B] dark:text-[#007ACD]" aria-hidden />
              <span className="font-semibold">User</span>
              <span className="mt-1 block text-xs text-muted">Post jobs for communities to bid on</span>
            </label>
            <label className="cursor-pointer rounded-xl border border-border p-2.5 transition-colors hover:border-[#7D07DB]/70 md:p-3 has-[:checked]:border-[#7D07DB] has-[:checked]:bg-[#7D07DB]/5">
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
        <div className="space-y-1.5 md:space-y-2">
          <Label>Full Name</Label>
          <Input className="h-9 md:h-10" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <Label>Email</Label>
          <Input type="email" className="h-9 md:h-10" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <PasswordInput id="register-password" autoComplete="new-password" className="h-9 md:h-10" {...register("password")} />
          <p className="text-xs text-muted">At least 6 characters</p>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {submitError && (
          <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {submitError.message}{" "}
            {submitError.emailConflict && (
              <Link href="/auth/login" className="font-semibold underline underline-offset-2">
                Log in
              </Link>
            )}
          </div>
        )}

        <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Creating..." : "Create Account"}</Button>

        <p className="text-center text-sm text-muted">Already have an account? <Link href="/auth/login" className="font-semibold text-info">Log in</Link></p>
      </form>
    </AuthLayout>


  );

}



export default function RegisterPage() {

  return (

    <GuestRoute>

      <Suspense fallback={<AuthLayout title="Create account" subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully." aside={<RoleContextPanel role="user" />}><p className="text-center text-sm text-muted">Loading...</p></AuthLayout>}>

        <RegisterForm />

      </Suspense>

    </GuestRoute>

  );

}

