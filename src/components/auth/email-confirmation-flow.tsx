"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { EmailConfirmationScreen } from "@/components/auth/email-confirmation-screen";

type ConfirmationVariant = "loading" | "success" | "error";

type ConfirmationState = {
  variant: ConfirmationVariant;
  detail?: string;
};

function isConsumedLinkError(message?: string) {
  if (!message) {
    return false;
  }

  return /invalid|expired/i.test(message);
}

export function EmailConfirmationFlow() {
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
  const [state, setState] = useState<ConfirmationState>({ variant: "loading" });

  useEffect(() => {
    let isCancelled = false;

    async function confirmAccount() {
      const params = new URLSearchParams(searchParamsString);
      const code = params.get("code");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error || errorDescription) {
        if (!isCancelled) {
          setState({
            variant: "error",
            detail: errorDescription ?? error ?? undefined,
          });
        }
        return;
      }

      if (!code) {
        if (!isCancelled) {
          setState({
            variant: "error",
            detail: "Abra novamente o link enviado para o seu e-mail.",
          });
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        if (!isCancelled) {
          setState({
            variant: "error",
            detail: "As variáveis de ambiente do Supabase ainda não foram configuradas.",
          });
        }
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();

      if (isCancelled) {
        return;
      }

      if (sessionData.session) {
        setState({ variant: "success" });
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (isCancelled) {
        return;
      }

      if (exchangeError) {
        const { data: retrySessionData } = await supabase.auth.getSession();

        if (isCancelled) {
          return;
        }

        if (retrySessionData.session && isConsumedLinkError(exchangeError.message)) {
          setState({ variant: "success" });
          return;
        }

        setState({
          variant: "error",
          detail: exchangeError.message,
        });
        return;
      }

      setState({ variant: "success" });
    }

    void confirmAccount();

    return () => {
      isCancelled = true;
    };
  }, [searchParamsString]);

  return <EmailConfirmationScreen variant={state.variant} detail={state.detail} />;
}
