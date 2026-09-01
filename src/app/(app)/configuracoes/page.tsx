import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
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
    <section className="lg:mx-[21px] lg:pt-[10px]">
      <div className="flex min-h-[82px] max-w-3xl items-center">
        <p className="text-sm leading-5 text-foreground">
          Ajustes essenciais para manter o workspace organizado, personalize suas
          configurações e dados do perfil.
        </p>
      </div>
      <div className="mt-[55px]">
        <ProfileSettingsForm name={name} email={email} avatarUrl={avatarUrl} />
      </div>
    </section>
  );
}
