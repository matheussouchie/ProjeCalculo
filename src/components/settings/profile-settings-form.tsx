"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { type ProfileActionState, updateProfileAction } from "@/app/actions/profile";
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

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome exibido</Label>
          <Input id="name" name="name" defaultValue={name} disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled readOnly />
        </div>
      </div>

      {state.message ? (
        <p
          className={
            state.ok
              ? "text-sm text-emerald-700 dark:text-emerald-300"
              : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Save aria-hidden="true" />
        )}
        Salvar alterações
      </Button>
    </form>
  );
}
