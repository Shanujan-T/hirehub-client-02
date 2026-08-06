import type { Community } from "@/types/community";

export function filterCommunities(
  communities: Community[],
  queryFilter: string,
  locationFilter: string,
  categoryIdFilter?: number | null
): Community[] {
  return communities.filter((community) => {
    if (categoryIdFilter != null && community.category_id !== categoryIdFilter) {
      return false;
    }
    if (
      locationFilter &&
      !(community.location ?? "").toLowerCase().includes(locationFilter.toLowerCase())
    ) {
      return false;
    }
    if (queryFilter) {
      const query = queryFilter.toLowerCase();
      return (
        community.name.toLowerCase().includes(query) ||
        (community.description ?? "").toLowerCase().includes(query)
      );
    }
    return true;
  });
}
