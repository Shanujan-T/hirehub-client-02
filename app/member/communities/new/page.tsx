"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { setActiveCommunityId } from "@/components/community-admin-route";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { createCommunitySchema, type CreateCommunityForm } from "@/lib/schemas";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { createCommunity } from "@/services/community";

export default function NewCommunityPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
  });

  const onSubmit = async (data: CreateCommunityForm) => {
    try {
      const community = await createCommunity({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
      });
      setActiveCommunityId(community.id);
      notify.success("Community created");
      router.push("/community-admin/dashboard");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to create community"));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell
        title="Create Community"
        subtitle="You will become the admin of this community"
        navItems={memberNav}
        backHref="/member/communities"
        backLabel="Back to communities"
      >
        <Card className="mx-auto max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="community-name">Community Name</Label>
              <Input id="community-name" {...register("name")} placeholder="e.g. Colombo Dev Collective" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-description">Description</Label>
              <Textarea
                id="community-description"
                {...register("description")}
                placeholder="What does your community do?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-location">Location</Label>
              <Input id="community-location" {...register("location")} placeholder="City or region (optional)" />
            </div>
            <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </form>
        </Card>
      </PortalShell>
    </AuthenticatedRoute>
  );
}
