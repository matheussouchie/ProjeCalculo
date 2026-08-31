"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import {
  type ProfileActionState,
  removeAvatarAction,
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
  avatarUrl?: string | null;
};

const initialState: ProfileActionState = {
  ok: false,
};

export function ProfileSettingsForm({
  name,
  email,
  avatarUrl,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
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
  const [removeState, removeFormAction, isRemovePending] = useActionState(
    removeAvatarAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok || removeState.ok) {
      router.refresh();
    }
  }, [removeState.ok, router, state.ok]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedFile(null);
      setAvatarError("Use uma imagem JPEG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setAvatarError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayedAvatarUrl = selectedFile ? previewUrl : avatarUrl ?? null;

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="avatar">Foto de perfil</Label>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-lg font-semibold text-foreground">
              {displayedAvatarUrl ? (
                <Image
                  src={displayedAvatarUrl}
                  alt="Prévia da foto de perfil"
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                name.slice(0, 1).toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-56 flex-1 space-y-2">
              <Input
                id="avatar"
                name="avatar"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isPending}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                JPEG, PNG ou WebP. Tamanho máximo de 5 MB.
              </p>
            </div>
          </div>
          {avatarError ? (
            <p className="text-sm text-destructive">{avatarError}</p>
          ) : null}
        </div>
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

      {avatarUrl ? (
        <form action={removeFormAction} className="-mt-4">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isRemovePending || isPending}
          >
            {isRemovePending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            Remover foto
          </Button>
          <StatusMessage state={removeState} />
        </form>
      ) : null}

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
