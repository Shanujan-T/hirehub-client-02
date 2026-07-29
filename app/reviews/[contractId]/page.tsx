"use client";



import { Suspense } from "react";

import { useParams, useRouter } from "next/navigation";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { DashboardPortalShell } from "@/components/portal-shell";

import { Button, Card, Input, Label, Textarea } from "@/components/ui";

import { reviewSchema, type ReviewForm } from "@/lib/schemas";

import { getErrorMessage } from "@/lib/utils";

import { createReview, getContract } from "@/services/contract";



function ReviewContent() {

  const params = useParams();

  const router = useRouter();

  const contractId = Number(params.contractId);

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<ReviewForm>({

    resolver: zodResolver(reviewSchema),

    defaultValues: { rating: 5 },

  });



  useEffect(() => {

    getContract(contractId).then((c) => {

      setValue("community_id", c.community_id);

      if (c.assigned_member_id) setValue("member_id", c.assigned_member_id);

    }).catch(() => toast.error("Failed to load contract"));

  }, [contractId, setValue]);



  const onSubmit = async (data: ReviewForm) => {

    try {

      await createReview({ contract_id: contractId, ...data });

      toast.success("Review submitted");

      router.push("/contracts");

    } catch (err) {

      toast.error(getErrorMessage(err, "Failed to submit review"));

    }

  };



  return (

    <AuthenticatedRoute>

      <DashboardPortalShell

        title="Leave a Review"

        subtitle="Rate the community and optional member"

       

        backHref={`/contracts/${contractId}`}

        backLabel="Back to contract"

      >

        <Card className="mx-auto max-w-md">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <input type="hidden" {...register("community_id")} />

            <div className="space-y-2"><Label>Member ID (optional)</Label><Input type="number" {...register("member_id")} /></div>

            <div className="space-y-2"><Label>Rating (1–5)</Label><Input type="number" min={1} max={5} {...register("rating")} /></div>

            <div className="space-y-2"><Label>Comment</Label><Textarea {...register("comment")} /></div>

            <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">Submit Review</Button>

          </form>

        </Card>

      </DashboardPortalShell>

    </AuthenticatedRoute>

  );

}



export default function ReviewPage() {

  return (

    <Suspense fallback={null}>

      <ReviewContent />

    </Suspense>

  );

}

