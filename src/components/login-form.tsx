"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { signInWithEmailAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  ok: false,
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInWithEmailAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@studio.com"
          autoComplete="email"
          required
        />
      </div>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Enviar link
      </Button>
    </form>
  );
}
