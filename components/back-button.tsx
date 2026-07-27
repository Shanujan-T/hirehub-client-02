"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getReturnToParam } from "@/lib/navigation";
import { Button } from "@/components/ui";

export function BackButton({
  fallbackHref,
  label = "Back",
  className,
}: {
  fallbackHref: string;
  label?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const href = getReturnToParam(searchParams, fallbackHref);

  return (
    <Link href={href} className={className}>
      <Button type="button" variant="ghost" size="sm" className="-ml-2 gap-1">
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
