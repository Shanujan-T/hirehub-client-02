"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { CommunityAvatar } from "@/components/community-avatar";
import { ImageUploadControl } from "@/components/image-upload-control";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { createCommunitySchema, type CreateCommunityForm } from "@/lib/schemas";
import { notify } from "@/lib/notify";
import { profileAccountSectionHref } from "@/lib/return-navigation";
import { getErrorMessage } from "@/lib/utils";
import { createCommunity, uploadCommunityImage } from "@/services/community";
import { getCategories } from "@/services/job";
import type { Category } from "@/types/job";
import type { Community } from "@/types/community";

const EXPERIENCE_OPTIONS = [
  { value: "less_than_1_year", label: "Less than 1 year" },
  { value: "1_to_3_years", label: "1–3 years" },
  { value: "3_plus_years", label: "3+ years" },
];

export default function NewCommunityPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState("Community");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);
  const [submittedCommunity, setSubmittedCommunity] = useState<Community | null>(null);
  const previewRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      portfolio_links: [],
      terms_accepted: undefined,
    },
  });

  const watchedName = watch("name");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => notify.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (watchedName?.trim()) setPreviewName(watchedName.trim());
  }, [watchedName]);

  useEffect(() => {
    setValue(
      "portfolio_links",
      portfolioLinks.map((link) => link.trim()).filter(Boolean)
    );
  }, [portfolioLinks, setValue]);

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
        category_id: data.category_id,
        experience_level: data.experience_level,
        specialization: data.specialization?.trim() || undefined,
        portfolio_links: data.portfolio_links?.length ? data.portfolio_links : undefined,
        admin_bio: data.admin_bio?.trim() || undefined,
        contact_phone: data.contact_phone?.trim() || undefined,
        terms_accepted: true,
      });

      if (imageFile) {
        await uploadCommunityImage(community.id, imageFile);
      }

      setSubmittedCommunity(community);
      notify.success("Community submitted for review");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to submit community"));
    }
  };

  if (submittedCommunity) {
    return (
      <AuthenticatedRoute>
        <DashboardPortalShell
          title="Community Submitted"
         
          backHref="/member/communities"
          backLabel="Back to communities"
        >
          <Card className="mx-auto max-w-lg space-y-4 text-center">
            <StatusBadge status={submittedCommunity.status} kind="community" />
            <p className="text-sm text-muted">
              Pending Verification — an admin will review your community shortly.
            </p>
            <Button variant="gradient" className="rounded-full" onClick={() => router.push("/member/communities")}>
              View My Communities
            </Button>
          </Card>
        </DashboardPortalShell>
      </AuthenticatedRoute>
    );
  }

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Create Community"
        subtitle="Submit your community for platform admin review"
       
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

            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <SelectMenu
                    value={field.value ? String(field.value) : ""}
                    onChange={(value) => field.onChange(Number(value))}
                    options={categories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                    }))}
                    placeholder="Select a category"
                  />
                )}
              />
              {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Experience level</Label>
              <Controller
                control={control}
                name="experience_level"
                render={({ field }) => (
                  <SelectMenu
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={EXPERIENCE_OPTIONS}
                    placeholder="Select experience level"
                  />
                )}
              />
              {errors.experience_level && (
                <p className="text-xs text-destructive">{errors.experience_level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization (optional)</Label>
              <Input id="specialization" {...register("specialization")} placeholder="e.g. React, plumbing, wedding photography" />
            </div>

            <div className="space-y-2">
              <Label>Portfolio links (optional)</Label>
              {portfolioLinks.map((link, index) => (
                <Input
                  key={index}
                  value={link}
                  onChange={(event) => {
                    const next = [...portfolioLinks];
                    next[index] = event.target.value;
                    setPortfolioLinks(next);
                  }}
                  placeholder="https://example.com/portfolio"
                />
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPortfolioLinks([...portfolioLinks, ""])}>
                  Add link
                </Button>
                {portfolioLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPortfolioLinks(portfolioLinks.slice(0, -1))}
                  >
                    Remove last
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-bio">Admin bio (optional)</Label>
              <Textarea
                id="admin-bio"
                {...register("admin_bio")}
                placeholder="Tell clients about your relevant experience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact phone (optional)</Label>
              <Input id="contact-phone" {...register("contact_phone")} placeholder="+94 77 123 4567" />
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" {...register("terms_accepted")} />
              <span>I confirm the information provided is accurate</span>
            </label>
            {errors.terms_accepted && (
              <p className="text-xs text-destructive">{errors.terms_accepted.message}</p>
            )}

            <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>

            <p className="text-center text-xs text-muted">
              <Link href={profileAccountSectionHref()} className="text-info hover:underline">
                Account verification
              </Link>{" "}
              is required before submission.
            </p>
          </form>
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
