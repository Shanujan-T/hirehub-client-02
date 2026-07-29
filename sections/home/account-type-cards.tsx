import Link from "next/link";
import { Building2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  title: string;
  description: string;
  checklist: string[];
  buttonLabel: string;
  href: string;
  icon: React.ReactNode;
  accentClass: string;
  iconWrapClass: string;
  checkClass?: string;
};

function ActionCard({
  title,
  description,
  checklist,
  buttonLabel,
  href,
  icon,
  accentClass,
  iconWrapClass,
  checkClass = "bg-info/10 text-info dark:bg-info/20",
}: ActionCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm dark:shadow-md dark:shadow-black/25">
      <div aria-hidden className={cn("h-1 w-full", accentClass)} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className={cn("mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-md", iconWrapClass)}>
          {icon}
        </div>
        <h3 className="text-xl font-extrabold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <ul className="mt-6 space-y-3">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-foreground">
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", checkClass)}>
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link href={href} className="mt-8 block">
          <Button variant="gradient" className="w-full rounded-xl">
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </article>
  );
}

const COMMUNITY_CHECKLIST = [
  "Skill-based profile & ratings",
  "Join or create a community",
  "Get picked for contracts by your admin",
] as const;

const POST_JOB_CHECKLIST = [
  "Post jobs with auto-suggested pricing",
  "Review communities & member profiles",
  "Approve deliverables & release payment",
] as const;

export function AccountTypeSection() {
  return (
    <section className="border-t border-border/60 bg-card/30 py-10 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-primary dark:text-foreground sm:text-3xl">
            What you can do on HireHub
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            One account for everything — pick an action to get started after you sign up.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <ActionCard
            title="Join a Community"
            description="Build your skill profile, join a trusted community, and get selected for contracts your community wins."
            checklist={[...COMMUNITY_CHECKLIST]}
            buttonLabel="Create Account"
            href="/auth/register"
            icon={<Users className="h-5 w-5 text-white" aria-hidden />}
            accentClass="bg-gradient-to-r from-info to-primary"
            iconWrapClass="bg-gradient-to-br from-info to-primary"
          />
          <ActionCard
            title="Post a Job"
            description="Post jobs, review applying communities and their members, and pay with confidence."
            checklist={[...POST_JOB_CHECKLIST]}
            buttonLabel="Create Account"
            href="/auth/register"
            icon={<Building2 className="h-5 w-5 text-white" aria-hidden />}
            accentClass="bg-brand-gradient"
            iconWrapClass="bg-brand-gradient"
            checkClass="bg-secondary/10 text-secondary dark:bg-secondary/20"
          />
        </div>
      </div>
    </section>
  );
}
