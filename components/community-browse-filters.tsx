import { Card, Input, Label } from "@/components/ui";

export function CommunityBrowseFilters({
  queryFilter,
  locationFilter,
  onQueryChange,
  onLocationChange,
  queryInputId = "community-q",
  locationInputId = "community-location",
}: {
  queryFilter: string;
  locationFilter: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  queryInputId?: string;
  locationInputId?: string;
}) {
  return (
    <Card className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={queryInputId}>Search</Label>
        <Input
          id={queryInputId}
          placeholder="Community name"
          value={queryFilter}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={locationInputId}>Location</Label>
        <Input
          id={locationInputId}
          placeholder="City or area"
          value={locationFilter}
          onChange={(event) => onLocationChange(event.target.value)}
        />
      </div>
    </Card>
  );
}
