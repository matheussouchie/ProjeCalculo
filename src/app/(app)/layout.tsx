import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserThemePreference } from "@/services/user-preferences/user-preferences.queries";
import type { AppUser } from "@/types/auth";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,email")
    .eq("id", user.id)
    .maybeSingle();
  const metadataName = String(user.user_metadata?.name ?? "").trim();
  const fallbackName = metadataName || user.email.split("@")[0];

  const appUser: AppUser = {
    id: user.id,
    name: profile?.name ?? fallbackName,
    email: profile?.email ?? user.email,
  };
  const themePreference = await getCurrentUserThemePreference();

  return (
    <AppShell user={appUser} themePreference={themePreference}>
      {children}
    </AppShell>
  );
}
