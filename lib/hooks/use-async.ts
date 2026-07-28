"use client";

import { useCallback, useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";

export function useAsyncList<T>(fetcher: () => Promise<T[]>, errorMsg = "Failed to load") {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher());
    } catch (err) {
      notify.error(getErrorMessage(err, errorMsg));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetcher, errorMsg]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, reload };
}

export function useAsyncItem<T>(fetcher: () => Promise<T>, errorMsg = "Failed to load") {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher());
    } catch (err) {
      notify.error(getErrorMessage(err, errorMsg));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher, errorMsg]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, reload };
}
