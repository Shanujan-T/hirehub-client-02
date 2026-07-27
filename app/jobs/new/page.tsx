"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { createJob, getCategories, getPricingSuggestion } from "@/services/job";
import type { Category } from "@/types/job";

export default function NewJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    location: "",
    deadline: "",
    final_price: "",
    suggested_price: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.category_id && form.location) {
      getPricingSuggestion(Number(form.category_id), form.location)
        .then((price) => setForm((f) => ({ ...f, suggested_price: price, final_price: String(price || f.final_price) })))
        .catch(console.error);
    }
  }, [form.category_id, form.location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJob({
        category_id: Number(form.category_id),
        title: form.title,
        description: form.description,
        location: form.location,
        deadline: form.deadline,
        final_price: Number(form.final_price),
      });
      toast.success("Job posted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Post a Job</h1>
          <p className="text-muted">Suggested price auto-fills from category + location</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Suggested Price: ${form.suggested_price}</Label>
            <Label>Final Price</Label>
            <Input type="number" step="0.01" value={form.final_price} onChange={(e) => setForm({ ...form, final_price: e.target.value })} required />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Job"}</Button>
        </form>
      </div>
    </AuthenticatedRoute>
  );
}
