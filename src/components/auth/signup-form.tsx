"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { signUpAction, type AuthActionState } from "@/app/actions/auth";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { ok: false };

export function SignupForm() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarError(null);

    if (!file) {
      setAvatarPreview(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarPreview(null);
      setAvatarError("Use uma imagem JPEG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarPreview(null);
      setAvatarError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Seu nome"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Seu e-mail"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          minLength={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar">Foto de perfil (opcional)</Label>
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-semibold">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Prévia da foto de perfil"
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : (
              "U"
            )}
          </div>
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={isPending}
            className="cursor-pointer"
          />
        </div>
        <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP, até 5 MB.</p>
        {avatarError ? <p className="text-sm text-destructive">{avatarError}</p> : null}
      </div>
      <AuthStatusMessage ok={state.ok} message={state.message} />
      <Button className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Criar conta
      </Button>
    </form>
  );
}
