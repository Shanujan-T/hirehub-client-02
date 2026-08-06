"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { ScopeSchemaBuilder } from "@/components/scope-schema-builder";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  approveCategory,
  rejectCategory,
  seedCategoryPricing,
  updateCategory,
} from "@/services/platform";
import { getCategories } from "@/services/job";
import type { Category, ScopeFieldDefinition } from "@/types/job";

function PendingCategoryCard({
  category,
  onDone,
}: {
  category: Category;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [schema, setSchema] = useState<ScopeFieldDefinition[]>([]);
  const [showApprovePanel, setShowApprovePanel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveCategory(category.id, {
        scope_schema: schema.length ? schema : null,
      });
      toast.success("Category approved");
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await rejectCategory(category.id, { reason: reason.trim() || undefined });
      toast.success("Category rejected");
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-3 space-y-3">
      <div>
        <p className="font-bold">{category.name}</p>
        <p className="text-sm text-muted">
          Requested by{" "}
          {category.requested_by?.full_name ||
            (category.requested_by_id ? `User #${category.requested_by_id}` : "Unknown")}
          {category.requested_by?.email ? ` (${category.requested_by.email})` : ""}
        </p>
        {category.request_description && (
          <p className="mt-2 text-sm text-foreground">{category.request_description}</p>
        )}
      </div>

      {showApprovePanel ? (
        <div className="space-y-3 border-t border-border pt-3">
          <p className="text-sm text-muted">
            Optional: define scope fields now, or skip and add them later via Edit Scope Fields.
          </p>
          <ScopeSchemaBuilder value={schema} onChange={setSchema} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="gradient"
              className="rounded-full"
              disabled={submitting}
              onClick={() => void handleApprove()}
            >
              {submitting ? "Approving…" : "Approve category"}
            </Button>
            <Button variant="outline" disabled={submitting} onClick={() => setShowApprovePanel(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Rejection reason (optional)</Label>
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Shown to admins if rejected"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="gradient"
              className="rounded-full"
              disabled={submitting}
              onClick={() => setShowApprovePanel(true)}
            >
              Approve…
            </Button>
            <Button variant="destructive" disabled={submitting} onClick={() => void handleReject()}>
              Reject
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AdminCategoriesContent() {
  const { getFilter, setFilter } = useListNavigation();
  const tab = getFilter("tab", "approved");
  const isPending = tab === "pending";

  const fetcher = useCallback(
    () => getCategories({ status: isPending ? "pending" : "approved" }),
    [isPending]
  );
  const { data: categories, loading, reload } = useAsyncList(fetcher);

  const [seedCategoryId, setSeedCategoryId] = useState<number | "">("");
  const [seedLocation, setSeedLocation] = useState("Kandy");
  const [seedPrice, setSeedPrice] = useState("45");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSchema, setEditSchema] = useState<ScopeFieldDefinition[]>([]);
  const [editBaselinePrice, setEditBaselinePrice] = useState("");
  const [editBaselineUnit, setEditBaselineUnit] = useState<"per_job" | "per_sqft" | "">("");
  const [saving, setSaving] = useState(false);

  const approvedForSeed = useMemo(
    () => (isPending ? [] : categories),
    [categories, isPending]
  );

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSchema(category.scope_schema ? [...category.scope_schema] : []);
    setEditBaselinePrice(
      category.baseline_price != null ? String(category.baseline_price) : ""
    );
    setEditBaselineUnit(category.baseline_unit ?? "");
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateCategory(editingId, {
        name: editName.trim(),
        scope_schema: editSchema.length ? editSchema : null,
        baseline_price: editBaselinePrice.trim() === "" ? null : Number(editBaselinePrice),
        baseline_unit: editBaselineUnit || null,
      });
      toast.success("Category updated");
      setEditingId(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!seedCategoryId) return;
    try {
      await seedCategoryPricing(Number(seedCategoryId), {
        location: seedLocation,
        average_price: Number(seedPrice),
        sample_size: 12,
      });
      toast.success("Pricing seeded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PortalShell
      title="Categories"
      subtitle="Approve requests, manage catalog, and edit scope fields"
      navItems={adminNav}
      actions={
        <Link href="/admin/categories/new">
          <Button variant="gradient" className="rounded-full">
            New category
          </Button>
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("tab", null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            !isPending
              ? "bg-primary text-white"
              : "border border-border bg-card text-muted hover:text-foreground"
          )}
        >
          Approved
        </button>
        <button
          type="button"
          onClick={() => setFilter("tab", "pending")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            isPending
              ? "bg-primary text-white"
              : "border border-border bg-card text-muted hover:text-foreground"
          )}
        >
          Pending
        </button>
      </div>

      {!isPending && (
        <Card className="mb-6 max-w-md space-y-3">
          <Label>Seed Pricing</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={seedCategoryId}
            onChange={(e) => setSeedCategoryId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select category</option>
            {approvedForSeed.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input
            value={seedLocation}
            onChange={(e) => setSeedLocation(e.target.value)}
            placeholder="Location"
          />
          <Input
            value={seedPrice}
            onChange={(e) => setSeedPrice(e.target.value)}
            placeholder="Average price"
            type="number"
            step="0.01"
          />
          <Button variant="outline" onClick={handleSeed}>
            Seed Pricing
          </Button>
        </Card>
      )}

      {loading ? (
        <LoadingState />
      ) : categories.length === 0 ? (
        <EmptyState
          title={isPending ? "No pending requests" : "No categories"}
          description={
            isPending
              ? "User category requests will show up here."
              : undefined
          }
        />
      ) : isPending ? (
        categories.map((c) => (
          <PendingCategoryCard key={c.id} category={c} onDone={reload} />
        ))
      ) : (
        categories.map((c) => (
          <Card key={c.id} className="mb-3 space-y-3">
            {editingId === c.id ? (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Baseline price (LKR)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editBaselinePrice}
                      onChange={(e) => setEditBaselinePrice(e.target.value)}
                      placeholder="e.g. 6000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Baseline unit</Label>
                    <SelectMenu
                      value={editBaselineUnit}
                      onChange={(v) =>
                        setEditBaselineUnit(v as "per_job" | "per_sqft" | "")
                      }
                      placeholder="None"
                      options={[
                        { value: "per_job", label: "Per job" },
                        { value: "per_sqft", label: "Per sq ft" },
                      ]}
                    />
                    <button
                      type="button"
                      className="text-xs text-muted hover:underline"
                      onClick={() => setEditBaselineUnit("")}
                    >
                      Clear unit
                    </button>
                  </div>
                </div>
                <ScopeSchemaBuilder value={editSchema} onChange={setEditSchema} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="gradient"
                    className="rounded-full"
                    disabled={saving}
                    onClick={() => void handleSave()}
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{c.name}</span>
                    {!c.scope_schema?.length && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        No scope fields
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {c.scope_schema?.length
                      ? `${c.scope_schema.length} scope field${c.scope_schema.length === 1 ? "" : "s"}: ${c.scope_schema.map((f) => f.label).join(", ")}`
                      : "Add scope fields so job posts can collect size/features for better pricing."}
                    {c.baseline_price != null && (
                      <>
                        {" · "}
                        Baseline LKR {c.baseline_price}
                        {c.baseline_unit === "per_sqft" ? "/sq ft" : "/job"}
                      </>
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                  Edit Scope Fields
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </PortalShell>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <Suspense fallback={<LoadingState />}>
        <AdminCategoriesContent />
      </Suspense>
    </AuthenticatedRoute>
  );
}
