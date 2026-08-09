"use client";



import { Suspense, useEffect, useState } from "react";

import { notify } from "@/lib/notify";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { ImageUploadControl } from "@/components/image-upload-control";

import { LoadingState } from "@/components/page-states";

import {
  addressPayloadForSave,
  ProfileLocationAddressFields,
  userAddressFromUser,
} from "@/components/profile-location-address-fields";

import { DashboardPortalShell } from "@/components/portal-shell";

import { UserAvatar } from "@/components/user-avatar";

import { Button, Card, Input, Label, Textarea } from "@/components/ui";

import { useAuth } from "@/providers/auth-provider";

import { getErrorMessage } from "@/lib/utils";

import { updateUser } from "@/services/contract";

import { removeUserAvatar, uploadUserAvatar } from "@/services/user";

import type { UserAddress } from "@/types/user";



function ClientProfileContent() {

  const { user, refreshUser, updateUser: setAuthUser } = useAuth();



  const [fullName, setFullName] = useState("");

  const [location, setLocation] = useState("");

  const [address, setAddress] = useState<UserAddress>({});

  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);



  useEffect(() => {

    if (user) {

      setFullName(user.full_name || "");

      setLocation(user.location || "");

      setAddress(userAddressFromUser(user));

      setBio(user.bio || "");

    }

  }, [user]);



  const handleSave = async () => {

    if (!user) return;

    const trimmedName = fullName.trim();

    if (!trimmedName) {

      notify.error("Full name is required");

      return;

    }

    setSaving(true);

    try {

      await updateUser(user.id, {

        full_name: trimmedName,

        location: location.trim() || null,

        bio,

        ...addressPayloadForSave(address),

      });

      await refreshUser();

      notify.success("Profile updated");

    } catch (err) {

      notify.error(getErrorMessage(err));

    } finally {

      setSaving(false);

    }

  };



  const handleAvatarUpload = async (file: File) => {

    if (!user) return;

    setUploadingAvatar(true);

    try {

      const updated = await uploadUserAvatar(user.id, file);

      setAuthUser(updated);

      notify.success("Profile picture updated");

    } catch (err) {

      notify.error(getErrorMessage(err, "Failed to upload profile picture"));

      throw err;

    } finally {

      setUploadingAvatar(false);

    }

  };

  const handleAvatarRemove = async () => {

    if (!user) return;

    setUploadingAvatar(true);

    try {

      const updated = await removeUserAvatar(user.id);

      setAuthUser(updated);

      notify.success("Profile picture removed");

    } catch (err) {

      notify.error(getErrorMessage(err, "Failed to remove profile picture"));

      throw err;

    } finally {

      setUploadingAvatar(false);

    }

  };



  return (

    <AuthenticatedRoute>

      <DashboardPortalShell title="My Profile" subtitle="Account details and profile picture">

        <Card className="mx-auto max-w-lg space-y-6">

          <ImageUploadControl

            label="Profile picture"

            previewUrl={user?.avatar_url}

            uploading={uploadingAvatar}

            avatarEditOverlay

            onUpload={handleAvatarUpload}

            onRemove={handleAvatarRemove}

            fallback={

              <UserAvatar

                name={user?.full_name ?? "Client"}

                avatarUrl={user?.avatar_url}

                size="lg"

                className="h-24 w-24 text-lg"

              />

            }

          />



          <div className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="full-name">Full Name</Label>

              <Input

                id="full-name"

                value={fullName}

                onChange={(e) => setFullName(e.target.value)}

                required

                autoComplete="name"

              />

            </div>

            <ProfileLocationAddressFields
              location={location}
              onLocationChange={setLocation}
              address={address}
              onAddressFieldChange={(field, value) =>
                setAddress((prev) => ({ ...prev, [field]: value }))
              }
            />

            <div className="space-y-2">

              <Label htmlFor="email">Email</Label>

              <Input id="email" value={user?.email ?? ""} readOnly disabled className="opacity-70" />

            </div>

          </div>



          <div className="space-y-2">

            <Label htmlFor="bio">Bio</Label>

            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />

            <Button variant="gradient" className="rounded-full" onClick={handleSave} disabled={saving}>

              {saving ? "Saving…" : "Save"}

            </Button>

          </div>

        </Card>

      </DashboardPortalShell>

    </AuthenticatedRoute>

  );

}



export default function ClientProfilePage() {

  return (

    <Suspense fallback={<LoadingState />}>

      <ClientProfileContent />

    </Suspense>

  );

}


