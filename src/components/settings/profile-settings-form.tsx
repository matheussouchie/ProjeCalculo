"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  type ProfileActionState,
  updateAccountPasswordAction,
  updateEmailAction,
  updateProfileAction,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileSettingsFormProps = {
  name: string;
  email: string;
};

const initialState: ProfileActionState = {
  ok: false,
};

export function ProfileSettingsForm({ name, email }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [emailState, emailAction, isEmailPending] = useActionState(
    updateEmailAction,
    initialState,
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    updateAccountPasswordAction,
    initialState,
  );

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome exibido</Label>
          <Input id="name" name="name" defaultValue={name} disabled={isPending} />
        </div>

        <StatusMessage state={state} />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          Atualizar perfil
        </Button>
      </form>

      <form action={emailAction} className="space-y-5 border-t pt-6">
        <div className="space-y-2">
          <Label htmlFor="email">Alterar email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            disabled={isEmailPending}
          />
        </div>

        <StatusMessage state={emailState} />

        <Button type="submit" variant="outline" disabled={isEmailPending}>
          {isEmailPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          Solicitar alteração de email
        </Button>
      </form>

      <form action={passwordAction} className="space-y-5 border-t pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              disabled={isPasswordPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirmar senha</Label>
            <Input
              id="confirmation"
              name="confirmation"
              type="password"
              minLength={6}
              disabled={isPasswordPending}
            />
          </div>
        </div>

        <StatusMessage state={passwordState} />

        <Button type="submit" variant="outline" disabled={isPasswordPending}>
          {isPasswordPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          Alterar senha
        </Button>
      </form>
    </div>
  );
}

function StatusMessage({ state }: { state: ProfileActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.ok
          ? "text-sm text-emerald-700 dark:text-emerald-300"
          : "text-sm text-destructive"
      }
    >
      {state.message}
    </p>
  );
}
