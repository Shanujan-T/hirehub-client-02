import { MapPin, Sparkles, Users } from "lucide-react";

const MOCK_MATCH = {
  community: "Harbour Craft Collective",
  members: 8,
  location: "Colombo",
  score: 92,
  blurb:
    "Strong plumbing and finishing skills on your kitchen remodel, with local crews ready to start this week.",
} as const;

function MatchScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#4d2bd8 ${clamped * 3.6}deg, color-mix(in srgb, #08308b 12%, transparent) 0deg)`,
      }}
      aria-label={`${clamped}% match`}
    >
      <div className="flex h-[3.85rem] w-[3.85rem] flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
        <span className="text-lg font-extrabold tabular-nums leading-none text-primary dark:text-foreground">
          {clamped}%
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          match
        </span>
      </div>
    </div>
  );
}

export function AiMatchingFeatureSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 py-12 lg:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-wash opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-25"
      />

      <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary dark:border-secondary/40 dark:bg-secondary/20">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Flagship feature
          </p>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-3xl">
            AI finds the right team for the job
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            HireHub ranks verified communities by skills, ratings, and location — then explains the
            top matches in plain language so you pick a team, not just a bid.
          </p>
        </div>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-md shadow-secondary/10 dark:shadow-black/30 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-xs font-bold text-info">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Matched
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Preview
            </span>
          </div>

          <div className="flex items-start gap-4">
            <MatchScoreRing score={MOCK_MATCH.score} />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold text-foreground">{MOCK_MATCH.community}</h3>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {MOCK_MATCH.members} members
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {MOCK_MATCH.location}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted italic">
                “{MOCK_MATCH.blurb}”
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
