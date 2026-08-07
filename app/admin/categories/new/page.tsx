"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { ScopeSchemaBuilder } from "@/components/scope-schema-builder";
import { Button, Card, Input, Label, SelectMenu } from "@/components/ui";
import { getErrorMessage } from "@/lib/utils";
import { createCategory } from "@/services/platform";
import type { ScopeFieldDefinition } from "@/types/job";

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schema, setSchema] = useState<ScopeFieldDefinition[]>([]);
  const [baselinePrice, setBaselinePrice] = useState("");
  const [baselineScopeKey, setBaselineScopeKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const numericFieldOptions = useMemo(() => {
    const options = [{ value: "", label: "Flat (per job)" }];
    schema.forEach((field) => {
      if (field.type === "number" && field.key) {
        options.push({
          value: field.key,
          label: field.label || field.key,
        });
      }
    });
    return options;
  }, [schema]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      await createCategory({
        name: name.trim(),
        scope_schema: schema.length ? schema : null,
        baseline_price: baselinePrice.trim() === "" ? null : Number(baselinePrice),
        baseline_scope_key: baselineScopeKey || null,
      });
      toast.success("Category created");
      router.push("/admin/categories");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell
        title="New Category"
        subtitle="Name plus optional scope fields for job posting"
        navItems={adminNav}
        backHref="/admin/categories"
        backLabel="Back to categories"
      >
        <Card className="mx-auto max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label>Category name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Landscaping"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Baseline price (LKR)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={baselinePrice}
                onChange={(e) => setBaselinePrice(e.target.value)}
                placeholder="e.g. 6000"
              />
            </div>
            <div className="space-y-2">
              <Label>Baseline scaling dimension</Label>
              <SelectMenu
                value={baselineScopeKey || ""}
                onChange={(v) => setBaselineScopeKey(v || null)}
                placeholder="Flat (per job)"
                options={numericFieldOptions}
              />
              <button
                type="button"
                className="text-xs text-muted hover:underline"
                onClick={() => setBaselineScopeKey(null)}
              >
                Clear scaling key
              </button>
            </div>
          </div>
          <ScopeSchemaBuilder value={schema} onChange={setSchema} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="gradient"
              className="rounded-full"
              disabled={saving}
              onClick={() => void handleCreate()}
            >
              {saving ? "Creating…" : "Create category"}
            </Button>
            <Link href="/admin/categories">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </Card>
      </PortalShell>
    </AuthenticatedRoute>
  );
}
