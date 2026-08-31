"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { discardDraftAction, saveDraftAction } from "@/app/actions/drafts";
import { notificationMessages, type NotificationTone } from "@/constants/notifications";
import type { DraftRecord, DraftScope } from "@/types/draft";

type AutosaveNotification = {
  tone: NotificationTone;
  message: string;
};

type UseAutosaveDraftOptions<TValues extends object> = {
  scope: DraftScope;
  entityId?: string | null;
  values: TValues;
  serverDraft?: DraftRecord<TValues> | null;
  isMeaningful: (values: TValues) => boolean;
  onRestore: (values: TValues) => void;
  onDiscard?: () => void;
};

const AUTOSAVE_DELAY_MS = 3000;

function getStorageKey(scope: DraftScope, entityId?: string | null) {
  return `ontime2:draft:${scope}:${entityId ?? "new"}`;
}

function safelyParseDraft<TValues>(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as TValues;
  } catch {
    return null;
  }
}

export function useAutosaveDraft<TValues extends object>({
  scope,
  entityId,
  values,
  serverDraft,
  isMeaningful,
  onRestore,
  onDiscard,
}: UseAutosaveDraftOptions<TValues>) {
  const storageKey = useMemo(() => getStorageKey(scope, entityId), [entityId, scope]);
  const [localDraft, setLocalDraft] = useState<TValues | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return safelyParseDraft<TValues>(window.localStorage.getItem(storageKey));
  });
  const [isServerDraftDismissed, setIsServerDraftDismissed] = useState(false);
  const [notification, setNotification] = useState<AutosaveNotification | null>(null);
  const [isOffline, setIsOffline] = useState(
    () => typeof window !== "undefined" && !window.navigator.onLine,
  );
  const [isPending, startTransition] = useTransition();
  const lastSyncedPayload = useRef("");
  const hasHydrated = useRef(false);

  const pendingDraft =
    localDraft ?? (isServerDraftDismissed ? null : serverDraft?.payload) ?? null;
  const hasPendingDraft = Boolean(pendingDraft);

  useEffect(() => {
    hasHydrated.current = true;

    function handleOnline() {
      setIsOffline(false);
      setNotification(null);
    }

    function handleOffline() {
      setIsOffline(true);
      setNotification({
        tone: "warning",
        message: notificationMessages.offline,
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hasHydrated.current || !isMeaningful(values)) {
      return;
    }

    const serializedValues = JSON.stringify(values);
    window.localStorage.setItem(storageKey, serializedValues);

    const timeout = window.setTimeout(() => {
      if (!window.navigator.onLine) {
        setIsOffline(true);
        setNotification({
          tone: "warning",
          message: notificationMessages.offline,
        });
        return;
      }

      if (lastSyncedPayload.current === serializedValues) {
        return;
      }

      startTransition(async () => {
        const response = await saveDraftAction({
          scope,
          entityId,
          payload: JSON.parse(serializedValues) as TValues,
        });

        if (response.ok) {
          lastSyncedPayload.current = serializedValues;
          setNotification({
            tone: "success",
            message: response.message ?? notificationMessages.autosaved,
          });
          return;
        }

        setNotification({
          tone: "error",
          message: response.message ?? notificationMessages.saveError,
        });
      });
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [entityId, isMeaningful, scope, storageKey, values]);

  const restoreDraft = useCallback(() => {
    if (!pendingDraft) {
      return;
    }

    onRestore(pendingDraft);
    setLocalDraft(null);
    setIsServerDraftDismissed(true);
    setNotification({
      tone: "success",
      message: notificationMessages.draftRestored,
    });
  }, [onRestore, pendingDraft]);

  const discardDraft = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setLocalDraft(null);
    setIsServerDraftDismissed(true);
    onDiscard?.();
    startTransition(async () => {
      await discardDraftAction({ scope, entityId });
    });
  }, [entityId, onDiscard, scope, storageKey]);

  const clearDraft = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setLocalDraft(null);
    setIsServerDraftDismissed(true);
    startTransition(async () => {
      await discardDraftAction({ scope, entityId });
    });
  }, [entityId, scope, storageKey]);

  return {
    notification:
      notification ??
      (isOffline
        ? { tone: "warning" as const, message: notificationMessages.offline }
        : null),
    hasPendingDraft,
    pendingDraft,
    isPending,
    restoreDraft,
    discardDraft,
    clearDraft,
  };
}
