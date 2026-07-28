"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { setActiveCommunityId } from "@/components/community-admin-route";
import { CommunityAvatar } from "@/components/community-avatar";
import { ImageUploadControl } from "@/components/image-upload-control";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { createCommunitySchema, type CreateCommunityForm } from "@/lib/schemas";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { createCommunity, uploadCommunityImage } from "@/services/community";

export default function NewCommunityPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState("Community");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
  });

  const watchedName = watch("name");

  useEffect(() => {
    if (watchedName?.trim()) setPreviewName(watchedName.trim());
  }, [watchedName]);

  const handleImageSelect = async (file: File) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setLocalPreview(objectUrl);
    setImageFile(file);
  };

  const onSubmit = async (data: CreateCommunityForm) => {
    try {
      const community = await createCommunity({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
      });

      if (imageFile) {
        await uploadCommunityImage(community.id, imageFile);
      }

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
            <ImageUploadControl
              label="Community image (optional)"
              shape="rounded"
              previewUrl={localPreview}
              onUpload={handleImageSelect}
              fallback={
                <CommunityAvatar
                  name={previewName}
                  imageUrl={localPreview}
                  size="lg"
                  className="h-24 w-24 sm:h-28 sm:w-28"
                />
              }
            />

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
