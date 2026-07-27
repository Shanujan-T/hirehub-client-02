import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Find local work through communities</h1>
        <p className="mt-2 text-muted">
          Employers post jobs. Skilled communities apply as a team. Admins assign work internally.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/auth/register">
          <Button>Get Started</Button>
        </Link>
        <Link href="/communities">
          <Button variant="outline">Browse Communities</Button>
        </Link>
      </div>
    </div>
  );
}
