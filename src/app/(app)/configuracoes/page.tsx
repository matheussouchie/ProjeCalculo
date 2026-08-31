import { Shield, Sparkles, UserRound } from "lucide-react";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicAvatarUrl } from "@/services/profile/avatar.service";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: profile } =
    supabase && user
      ? await supabase
          .from("profiles")
          .select("name,email,created_at,avatar_path")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };

  const fallbackName = String(user?.user_metadata?.name ?? "").trim();
  const name = (profile?.name ?? fallbackName) || "Usuário";
  const email = profile?.email ?? user?.email ?? "";
  const avatarUrl =
    supabase && profile?.avatar_path
      ? getPublicAvatarUrl(supabase, profile.avatar_path)
      : null;

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <Badge variant="secondary">Configurações</Badge>
        <h2 className="mt-4">Conta e workspace</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ajustes essenciais para manter o workspace organizado, seguro e pronto para
          evoluir sem adicionar complexidade ao produto.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/5 text-primary">
                <UserRound className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm name={name} email={email} avatarUrl={avatarUrl} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Shield className="size-4" aria-hidden="true" />
                </div>
                <CardTitle>Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Autenticação Supabase ativa com sessão protegida no App Router.</p>
              <p>Email principal: {email || "não informado"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                </div>
                <CardTitle>Aprendizado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>O motor considera histórico real e suavização estatística.</p>
              <p>
                Projetos recentes têm maior influência sem gerar oscilações bruscas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
