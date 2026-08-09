"use client";



import Link from "next/link";

import { Suspense } from "react";

import { Briefcase, Check, HardHat } from "lucide-react";

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

const ROLE_PANEL_CONTENT = {
  user: {
    heading: "Post jobs, get real work done",
    points: [
      "Post a job with auto-suggested pricing",
      "Review applying communities and their members",
      "Message the community admin directly",
      "Approve deliverables and release payment with confidence",
    ],
  },
  employer: {
    heading: "Join a community, do the work",
    points: [
      "Build a skill-based profile with ratings",
      "Join or create a trusted community",
      "Apply to contracts your community wins",
      "Get paid directly for approved work",
    ],
  },
} as const;

function RoleContextPanel({ role }: { role: "user" | "employer" }) {
  const content = ROLE_PANEL_CONTENT[role];
  const Icon = role === "user" ? Briefcase : HardHat;

  return (
    <div className="relative flex h-full flex-col justify-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div
          className={role === "user"
            ? "absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[#007ACD]/20 blur-3xl dark:bg-[#007ACD]/18"
            : "absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#7D07DB]/20 blur-3xl dark:bg-[#7D07DB]/18"}
        />
        <div
          className={role === "user"
            ? "absolute -bottom-24 -left-28 h-64 w-64 rounded-full bg-[#08308B]/15 blur-3xl dark:bg-[#08308B]/25"
            : "absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#4D2BD8]/18 blur-3xl dark:bg-[#4D2BD8]/25"}
        />
        <div
          className={role === "user"
            ? "absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-[#4D2BD8]/10 blur-3xl"
            : "absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-[#007ACD]/10 blur-3xl"}
        />
      </div>
      <div className="relative z-10">
        <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-xl shadow-[#4D2BD8]/30 ring-1 ring-white/20">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="max-w-md text-3xl font-extrabold tracking-tight text-[#08308B] dark:text-foreground">
          {content.heading}
        </h2>
        <ul className="mt-8 space-y-4">
          {content.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
              <span className={role === "user" ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#007ACD]/15 text-[#007ACD] dark:bg-[#007ACD]/25" : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7D07DB]/15 text-[#7D07DB] dark:bg-[#7D07DB]/25"}>
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </span>
              <span className="pt-0.5">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}



function RegisterForm() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") === "employer" ? "employer" : "user";

  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: requestedRole },
  });
  const selectedRole = watch("role", requestedRole);

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
    <AuthLayout
      title="Create account"
      subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully."
      aside={<RoleContextPanel role={selectedRole} />}
    >
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

      <Suspense fallback={<AuthLayout title="Create account" subtitle="Choose one — post jobs, or join a community to do the work. You can't switch later, so pick carefully." aside={<RoleContextPanel role="user" />}><p className="text-center text-sm text-muted">Loading...</p></AuthLayout>}>

        <RegisterForm />

      </Suspense>

    </GuestRoute>

  );

}

