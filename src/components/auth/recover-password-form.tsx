"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { recoverPasswordAction, type AuthActionState } from "@/app/actions/auth";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

export function RecoverPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    recoverPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <AuthStatusMessage ok={state.ok} message={state.message} />
      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Enviar instrucoes
      </Button>
    </form>
  );
}
