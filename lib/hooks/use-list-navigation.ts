"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import {
  appendReturnTo,
  listKeyFromPath,
  restoreListScroll,
  saveListScroll,
} from "@/lib/navigation";

export function useListNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const listKey = useMemo(() => {
    const q = searchParams.toString();
    return listKeyFromPath(pathname, q ? `?${q}` : "");
  }, [pathname, searchParams]);

  useEffect(() => {
    restoreListScroll(listKey);
  }, [listKey]);

  const hrefWithReturn = useCallback(
    (targetHref: string) => {
      saveListScroll(listKey);
      return appendReturnTo(targetHref, listKey);
    },
    [listKey]
  );

  const navigateWithReturn = useCallback(
    (targetHref: string) => {
      router.push(hrefWithReturn(targetHref));
    },
    [hrefWithReturn, router]
  );

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const getFilter = useCallback(
    (key: string, defaultValue = "") => searchParams.get(key) ?? defaultValue,
    [searchParams]
  );

  return { listKey, hrefWithReturn, navigateWithReturn, setFilter, getFilter };
}
