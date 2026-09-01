"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import {
  type ProfileActionState,
  updateProfileSettingsAction,
} from "@/app/actions/profile";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileSettingsFormProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

const initialState: ProfileActionState = { ok: false };

export function ProfileSettingsForm({
  name,
  email,
  avatarUrl,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    updateProfileSettingsAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state.ok]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAvatarError(null);

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Use uma imagem JPEG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="w-full rounded-[10px] bg-[#f5f1f7] px-5 py-[30px] shadow-[var(--shadow-card)] dark:bg-[#80658c]"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <Label htmlFor="name" className="text-lg">
            Nome Exibido
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            disabled={isPending}
            className="bg-transparent font-bold shadow-none dark:bg-transparent"
          />
        </div>
        <div className="flex min-h-[150px] flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isPending}
            aria-label="Alterar a foto do perfil"
            title="Clique para alterar a foto"
            className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <UserAvatar
              user={{
                id: "settings-profile",
                name,
                email,
                avatarUrl: previewUrl,
              }}
              className="size-[150px] border-0 text-3xl shadow-[var(--shadow-card)]"
            />
          </button>
          <input
            ref={avatarInputRef}
            id="avatar"
            name="avatar"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={isPending}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      </div>

      {avatarError ? (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {avatarError}
        </p>
      ) : null}

      <div className="my-5 border-t border-[#c5b7c9]" />

      <div className="space-y-5">
        <Label htmlFor="email" className="text-lg">
          Alterar e-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          disabled={isPending}
          className="bg-transparent font-bold shadow-none dark:bg-transparent"
        />
      </div>

      <div className="my-5 border-t border-[#c5b7c9]" />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Label htmlFor="password" className="text-lg">
            Nova Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={6}
            autoComplete="new-password"
            disabled={isPending}
            className="bg-transparent font-bold shadow-none dark:bg-transparent"
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="confirmation" className="text-lg">
            Confirmar Senha
          </Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            minLength={6}
            autoComplete="new-password"
            disabled={isPending}
            className="bg-transparent font-bold shadow-none dark:bg-transparent"
          />
        </div>
      </div>

      <StatusMessage state={state} />

      <Button type="submit" disabled={isPending} className="mt-5 w-full">
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Save aria-hidden="true" />
        )}
        Salvar Alterações no Perfil
      </Button>
    </form>
  );
}

function StatusMessage({ state }: { state: ProfileActionState }) {
  if (!state.message) return null;

  return (
    <p
      role="status"
      className={
        state.ok
          ? "mt-5 text-sm text-emerald-700 dark:text-emerald-200"
          : "mt-5 text-sm text-destructive"
      }
    >
      {state.message}
    </p>
  );
}
