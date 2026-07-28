export type MemberDetailContext = "public" | "admin";

export function communityMemberDetailPath(
  communityId: number,
  membershipId: number,
  context: MemberDetailContext = "public"
): string {
  if (context === "admin") {
    return `/community-admin/my-community/members/${membershipId}`;
  }
  return `/communities/${communityId}/members/${membershipId}`;
}
