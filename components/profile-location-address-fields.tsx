"use client";

import { Input, Label } from "@/components/ui";
import type { UserAddress } from "@/types/user";

type ProfileLocationAddressFieldsProps = {
  location: string;
  onLocationChange: (value: string) => void;
  address: UserAddress;
  onAddressFieldChange: (field: keyof UserAddress, value: string) => void;
};

export function ProfileLocationAddressFields({
  location,
  onLocationChange,
  address,
  onAddressFieldChange,
}: ProfileLocationAddressFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="location">Location (public)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City or region, e.g. Kandy"
          autoComplete="address-level2"
        />
        <p className="text-xs text-muted">
          Short label shown on public listings and cards. Use your city or region, not your full street address.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Address (private)</p>
          <p className="text-xs text-muted">
            Full postal address for your account and platform logistics. Not shown on public profile views.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address-line1">Street address</Label>
          <Input
            id="address-line1"
            value={address.address_line1 ?? ""}
            onChange={(e) => onAddressFieldChange("address_line1", e.target.value)}
            placeholder="House / building and street"
            autoComplete="address-line1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address-line2">Apartment, suite, etc. (optional)</Label>
          <Input
            id="address-line2"
            value={address.address_line2 ?? ""}
            onChange={(e) => onAddressFieldChange("address_line2", e.target.value)}
            autoComplete="address-line2"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address-city">City</Label>
            <Input
              id="address-city"
              value={address.address_city ?? ""}
              onChange={(e) => onAddressFieldChange("address_city", e.target.value)}
              autoComplete="address-level2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-region">Region / province</Label>
            <Input
              id="address-region"
              value={address.address_region ?? ""}
              onChange={(e) => onAddressFieldChange("address_region", e.target.value)}
              autoComplete="address-level1"
            />
          </div>
        </div>
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="address-postal">Postal code</Label>
          <Input
            id="address-postal"
            value={address.address_postal_code ?? ""}
            onChange={(e) => onAddressFieldChange("address_postal_code", e.target.value)}
            autoComplete="postal-code"
          />
        </div>
      </div>
    </>
  );
}

export function userAddressFromUser(user: {
  address_line1?: string | null;
  address_line2?: string | null;
  address_city?: string | null;
  address_region?: string | null;
  address_postal_code?: string | null;
} | null | undefined): UserAddress {
  return {
    address_line1: user?.address_line1 ?? "",
    address_line2: user?.address_line2 ?? "",
    address_city: user?.address_city ?? "",
    address_region: user?.address_region ?? "",
    address_postal_code: user?.address_postal_code ?? "",
  };
}

export function addressPayloadForSave(address: UserAddress) {
  const trim = (v: string | null | undefined) => {
    const t = (v ?? "").trim();
    return t || null;
  };
  return {
    address_line1: trim(address.address_line1),
    address_line2: trim(address.address_line2),
    address_city: trim(address.address_city),
    address_region: trim(address.address_region),
    address_postal_code: trim(address.address_postal_code),
  };
}
