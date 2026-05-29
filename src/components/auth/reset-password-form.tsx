"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { updatePasswordAction, type AuthActionState } from "@/app/actions/auth";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmation">Confirmar senha</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          minLength={6}
          required
        />
      </div>
      <AuthStatusMessage ok={state.ok} message={state.message} />
      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Atualizar senha
      </Button>
    </form>
  );
}
