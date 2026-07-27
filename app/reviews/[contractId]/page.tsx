"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { createReview } from "@/services/contract";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.contractId);
  const [form, setForm] = useState({ community_id: "", member_id: "", rating: "5", comment: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({
        contract_id: contractId,
        community_id: Number(form.community_id),
        member_id: form.member_id ? Number(form.member_id) : undefined,
        rating: Number(form.rating),
        comment: form.comment,
      });
      toast.success("Review submitted");
      router.push("/contracts");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Leave a Review</h1>
          <p className="text-muted">Rate the community and optionally a member</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Community ID</Label>
            <Input value={form.community_id} onChange={(e) => setForm({ ...form, community_id: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Member ID (optional)</Label>
            <Input value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Rating (1-5)</Label>
            <Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</Button>
        </form>
      </div>
    </AuthenticatedRoute>
  );
}
