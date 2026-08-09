"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { JobScopeFields } from "@/components/job-scope-fields";
import { DashboardPortalShell } from "@/components/portal-shell";
import { Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { createJobSchema, type CreateJobForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import {
  createJob,
  generateJobDescription,
  getCategories,
  getPricingSuggestion,
  requestCategory,
} from "@/services/job";
import type { Category, ScopeData } from "@/types/job";

function cleanScopeData(data: ScopeData): ScopeData {
  const cleaned: ScopeData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === "" || value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "number" && Number.isNaN(value)) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

function isMeaningfullyFilledScopeValue(value: ScopeData[string], type: string): boolean {
  if (type === "number") {
    // Zero is an entered numeric value. Do not use truthiness here: it would
    // incorrectly treat 0 as missing.
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

export default function NewJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [suggestedLow, setSuggestedLow] = useState<number | null>(null);
  const [suggestedHigh, setSuggestedHigh] = useState<number | null>(null);
  const [sampleSize, setSampleSize] = useState(0);
  const [priceMethod, setPriceMethod] = useState<string | null>(null);
  const [priceNote, setPriceNote] = useState<string | null>(null);
  const [isSeededEstimate, setIsSeededEstimate] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [roughPrompt, setRoughPrompt] = useState("");
  const [scopeData, setScopeData] = useState<ScopeData>({});
  const [eventTime, setEventTime] = useState("");
  const [showRequestCategory, setShowRequestCategory] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
  });
  const categoryId = watch("category_id");
  const location = watch("location");
  const deadline = watch("deadline");

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === Number(categoryId)) ?? null,
    [categories, categoryId]
  );
  const scopeSchema =
    selectedCategory?.scope_fields ?? selectedCategory?.scope_schema ?? [];
  const isPhotography = selectedCategory?.name.trim().toLowerCase() === "photography";

  useEffect(() => {
    getCategories().then(setCategories).catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    setScopeData({});
    setEventTime("");
  }, [categoryId]);

  const locationTrimmed = (location ?? "").trim();
  // Stable serialization so scope edits (word_count, etc.) always retrigger pricing.
  const scopeDataKey = JSON.stringify(cleanScopeData(scopeData));
  const scopeReady = scopeSchema.every((field) => {
    if (field.required === false) return true;
    return isMeaningfullyFilledScopeValue(scopeData[field.key], field.type);
  });
  const deadlineReady =
    typeof deadline === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(deadline) &&
    !Number.isNaN(Date.parse(`${deadline}T00:00:00`));
  const pricingReady = Boolean(categoryId && locationTrimmed && scopeReady && deadlineReady);

  useEffect(() => {
    const scopeFields = scopeSchema.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required !== false,
      value: scopeData[field.key],
      filled:
        field.required === false ||
        isMeaningfullyFilledScopeValue(scopeData[field.key], field.type),
    }));
    console.info("[suggested-price] readiness check", {
      categoryId,
      location: locationTrimmed,
      deadline,
      deadlineReady,
      scopeFields,
      scopeReady,
      pricingReady,
    });
  }, [categoryId, deadline, deadlineReady, locationTrimmed, pricingReady, scopeDataKey, scopeReady, scopeSchema]);

  useEffect(() => {
    if (!categoryId) {
      setSuggested(null);
      setSuggestedLow(null);
      setSuggestedHigh(null);
      setSampleSize(0);
      setPriceMethod(null);
      setPriceNote(null);
      setIsSeededEstimate(false);
      return;
    }
    if (!locationTrimmed) {
      setSuggested(null);
      setSuggestedLow(null);
      setSuggestedHigh(null);
      setSampleSize(0);
      setPriceMethod(null);
      setPriceNote(null);
      setIsSeededEstimate(false);
      return;
    }
    if (!scopeReady) {
      setSuggested(null);
      setSuggestedLow(null);
      setSuggestedHigh(null);
      setSampleSize(0);
      setPriceMethod("scope_required");
      setPriceNote("Select job scope to see a price suggestion.");
      setIsSeededEstimate(false);
      return;
    }
    if (!deadlineReady) {
      setSuggested(null);
      setSuggestedLow(null);
      setSuggestedHigh(null);
      setSampleSize(0);
      setPriceMethod("deadline_required");
      setPriceNote(null);
      setIsSeededEstimate(false);
      return;
    }

    // Debounce so inputs don't fire on every keystroke.
    const handle = window.setTimeout(() => {
      const requestScope = cleanScopeData(scopeData);
      console.info("[suggested-price] requesting suggestion", {
        categoryId: Number(categoryId),
        location: locationTrimmed,
        scopeData: requestScope,
        deadline,
      });
      getPricingSuggestion(Number(categoryId), locationTrimmed, requestScope, deadline)
        .then((p) => {
          console.info("[suggested-price] response", p);
          const price = p.suggested_price ?? p.average_price ?? null;
          setSuggested(price);
          setSuggestedLow(p.suggested_price_low ?? null);
          setSuggestedHigh(p.suggested_price_high ?? null);
          setSampleSize(p.sample_size ?? 0);
          setPriceMethod(p.method ?? null);
          setPriceNote(p.note ?? null);
          setIsSeededEstimate(Boolean(p.is_seeded_estimate));
          if (price != null) setValue("final_price", price);
        })
        .catch((err) => {
          console.error("[suggested-price] request failed", err, {
            categoryId,
            location: locationTrimmed,
            scopeData: requestScope,
            deadline,
          });
          setSuggested(null);
          setSuggestedLow(null);
          setSuggestedHigh(null);
          setSampleSize(0);
          setPriceMethod(null);
          setPriceNote(getErrorMessage(err) || "Could not load price suggestion.");
          setIsSeededEstimate(false);
        });
    }, 400);

    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, locationTrimmed, scopeDataKey, setValue, scopeReady, deadline, deadlineReady]);

  const handleGenerate = async () => {
    const prompt = roughPrompt.trim() || watch("title") || watch("description") || "";
    if (!prompt.trim()) {
      toast.error("Add a short prompt or title first");
      return;
    }
    if (aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const suggestion = await generateJobDescription(prompt.trim());
      if (!suggestion) {
        setAiUnavailable(true);
        return;
      }
      setValue("title", suggestion.title);
      setValue("description", suggestion.description);
      if (suggestion.category_id) setValue("category_id", suggestion.category_id);
    } catch (err) {
      setAiUnavailable(true);
      toast.error(getErrorMessage(err, "AI suggestion unavailable"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleRequestCategory = async () => {
    if (!requestName.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (requesting) return;
    setRequesting(true);
    try {
      await requestCategory({
        name: requestName.trim(),
        description: requestDescription.trim() || undefined,
      });
      setRequestSubmitted(true);
      setShowRequestCategory(false);
      setRequestName("");
      setRequestDescription("");
      toast.success("Your category request is pending admin review");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit category request"));
    } finally {
      setRequesting(false);
    }
  };

  const onSubmit = async (data: CreateJobForm) => {
    if (isPhotography && !eventTime) {
      toast.error("Select the event time for this photography job");
      return;
    }
    try {
      const cleaned = cleanScopeData(scopeData);
      await createJob({
        ...data,
        suggested_price: suggested,
        ...(isPhotography ? { event_time: eventTime } : {}),
        scope_data: Object.keys(cleaned).length ? cleaned : null,
      });
      toast.success("Job posted");
      router.push("/jobs");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to post job"));
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="Post a Job" subtitle="Communities apply as teams — not individuals">
        <Card className="mx-auto max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="ai-prompt">Generate with AI</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={aiLoading}
                  onClick={() => void handleGenerate()}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {aiLoading ? "Generating…" : "Generate Description"}
                </Button>
              </div>
              <Input
                id="ai-prompt"
                value={roughPrompt}
                onChange={(e) => setRoughPrompt(e.target.value)}
                placeholder="e.g. Need a wedding photographer in Colombo next month"
                disabled={aiLoading}
              />
              {aiUnavailable && (
                <p className="text-xs text-muted">
                  AI suggestion unavailable — write your own copy.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-category">Category</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <SelectMenu
                    id="job-category"
                    value={field.value ? String(field.value) : ""}
                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    onBlur={field.onBlur}
                    placeholder="Select category"
                    options={categories.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                      icon: <FolderOpen className="h-4 w-4" aria-hidden />,
                    }))}
                  />
                )}
              />
              {errors.category_id && (
                <p className="text-xs text-destructive">{errors.category_id.message}</p>
              )}
              {requestSubmitted && (
                <p className="text-xs text-muted">
                  Your category request is pending admin review. You can keep posting under an
                  approved category meanwhile.
                </p>
              )}
              {!showRequestCategory ? (
                <button
                  type="button"
                  className="text-left text-xs font-medium text-info hover:underline"
                  onClick={() => setShowRequestCategory(true)}
                >
                  Don&apos;t see your category? Request a new one
                </button>
              ) : (
                <div className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3">
                  <p className="text-sm font-semibold">Request a category</p>
                  <div className="space-y-1">
                    <Label htmlFor="request-cat-name">Category name</Label>
                    <Input
                      id="request-cat-name"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="e.g. Drone Photography"
                      disabled={requesting}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="request-cat-why">Why is it needed? (optional)</Label>
                    <Textarea
                      id="request-cat-why"
                      rows={2}
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="Short note for the admin reviewer"
                      disabled={requesting}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={requesting}
                      onClick={() => void handleRequestCategory()}
                    >
                      {requesting ? "Submitting…" : "Submit request"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={requesting}
                      onClick={() => setShowRequestCategory(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input {...register("location")} placeholder="e.g. Colombo" />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location.message}</p>
              )}
              <p className="text-xs text-muted">
                Needed for a price suggestion (local history or category baseline).
              </p>
            </div>

            {scopeSchema.length > 0 ? (
              <JobScopeFields schema={scopeSchema} value={scopeData} onChange={setScopeData} />
            ) : selectedCategory ? (
              <p className="text-xs text-muted">
                This category has no scope fields yet (flat pricing). Admins can add them under
                Categories → Edit Scope Fields.
              </p>
            ) : (
              <p className="text-xs text-muted">
                Select a category to load any scope fields defined for it (e.g. area, features).
              </p>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isPhotography ? "Event date" : "Deadline"}</Label>
              <Input type="date" {...register("deadline")} />
              {isPhotography && (
                <>
                  <Label htmlFor="event-time">Event time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(event) => setEventTime(event.target.value)}
                    required
                  />
                </>
              )}
            </div>
            {categoryId && (
              <div className="rounded-xl border border-info/30 bg-info/10 p-4">
              <Label className="flex items-center gap-2 text-info">
                <Info className="h-4 w-4" />
                {priceMethod === "web_fallback" ? "Price Estimate" : "Suggested Price"}
              </Label>
              {suggested != null ? (
                <>
                  <p className="mt-1 text-2xl font-extrabold text-info">
                    {suggestedLow != null && suggestedHigh != null && suggestedLow !== suggestedHigh
                      ? `LKR ${suggestedLow.toLocaleString(undefined, { maximumFractionDigits: 2 })} – ${suggestedHigh.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : `LKR ${suggested.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    {sampleSize > 0 && (
                      <span className="text-sm font-normal"> ({sampleSize} samples)</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {priceMethod === "web_fallback"
                      ? "Estimated from web sources (limited local data available)."
                      : sampleSize > 0 && !isSeededEstimate
                      ? priceNote || "Estimated from local completed contracts"
                      : isSeededEstimate
                        ? priceNote ||
                          (priceMethod === "seeded_district_estimate"
                            ? "Estimated (regional baseline — no completed contracts yet)"
                            : "Estimated (no local data yet)")
                        : priceMethod === "posted_jobs_average"
                          ? priceNote ||
                            `Based on ${sampleSize} similar job posting${sampleSize === 1 ? "" : "s"} (asking prices, not yet completed)`
                          : priceMethod === "historical_average" || priceMethod === "scope_adjusted"
                            ? priceNote ||
                              `Based on ${sampleSize} completed job${sampleSize === 1 ? "" : "s"} in this area`
                            : priceNote || "Suggested price"}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted">
                  {!categoryId
                    ? "Select a category to see a price estimate."
                    : !locationTrimmed
                      ? "Enter a location to see a price estimate."
                      : !scopeReady
                        ? "Select job scope to see a price suggestion."
                      : priceMethod === "insufficient_data" || priceNote
                        ? priceNote || "No pricing data for this category + location yet."
                        : "Loading price suggestion…"}
                </p>
              )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Final Price</Label>
              <Input type="number" step="0.01" {...register("final_price")} />
            </div>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="w-full rounded-full"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
