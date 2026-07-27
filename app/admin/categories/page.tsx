"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { createCategory, seedCategoryPricing } from "@/services/platform";
import { getCategories } from "@/services/job";

export default function AdminCategoriesPage() {
  const { data: categories, loading, reload } = useAsyncList(useCallback(() => getCategories(), []));
  const [name, setName] = useState("");
  const [seedCategoryId, setSeedCategoryId] = useState<number | "">("");
  const [seedLocation, setSeedLocation] = useState("Kandy");
  const [seedPrice, setSeedPrice] = useState("45");

  const handleCreate = async () => {
    try {
      await createCategory({ name });
      toast.success("Category created");
      setName("");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
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
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Categories" subtitle="Manage category catalog + seed category_pricing" navItems={adminNav}>
        <Card className="mb-6 max-w-md space-y-3">
          <Label>New Category</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <Button variant="gradient" className="rounded-full" onClick={handleCreate}>Create</Button>
        </Card>
        <Card className="mb-6 max-w-md space-y-3">
          <Label>Seed Pricing</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={seedCategoryId}
            onChange={(e) => setSeedCategoryId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Input value={seedLocation} onChange={(e) => setSeedLocation(e.target.value)} placeholder="Location" />
          <Input value={seedPrice} onChange={(e) => setSeedPrice(e.target.value)} placeholder="Average price" type="number" step="0.01" />
          <Button variant="outline" onClick={handleSeed}>Seed Pricing</Button>
        </Card>
        {loading ? <LoadingState /> : categories.length === 0 ? (
          <EmptyState title="No categories" />
        ) : (
          categories.map((c) => (
            <Card key={c.id} className="mb-2"><span className="font-bold">{c.name}</span></Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
