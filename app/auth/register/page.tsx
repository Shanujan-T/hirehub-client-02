"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, User } from "lucide-react";
import { notify } from "@/lib/notify";
import { AuthLayout } from "@/components/auth-layout";
import { GuestRoute } from "@/components/auth-guard";
import { Button, Input, Label, PasswordInput, SelectMenu } from "@/components/ui";
import { registerSchema, type RegisterForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "User",
    icon: <User className="h-4 w-4" aria-hidden />,
  },
  {
    value: "employer",
    label: "Employer",
    icon: <Briefcase className="h-4 w-4" aria-hidden />,
  },
];

function roleFromParam(param: string | null): RegisterForm["role"] {
  return param === "employer" ? "employer" : "user";
}

function RegisterForm() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = roleFromParam(searchParams.get("role"));

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: roleFromUrl },
  });

  useEffect(() => {
    reset((current) => ({ ...current, role: roleFromUrl }));
  }, [roleFromUrl, reset]);

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
    <AuthLayout title="Create account" subtitle="Join as employer or skilled member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account-type">Account Type</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <SelectMenu
                id="account-type"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={ROLE_OPTIONS}
              />
            )}
          />
        </div>
        <div className="space-y-2"><Label>Full Name</Label><Input {...register("full_name")} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
        <div className="space-y-2"><Label htmlFor="register-password">Password</Label><PasswordInput id="register-password" autoComplete="new-password" {...register("password")} /></div>
        <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Creating..." : "Create Account"}</Button>
        <p className="text-center text-sm text-muted">Already have an account? <Link href="/auth/login" className="font-semibold text-info">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <GuestRoute>
      <Suspense fallback={<AuthLayout title="Create account" subtitle="Join as employer or skilled member"><p className="text-center text-sm text-muted">Loading...</p></AuthLayout>}>
        <RegisterForm />
      </Suspense>
    </GuestRoute>
  );
}
