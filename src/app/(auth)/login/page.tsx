import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Entrar"
      description="Acesse seu workspace para acompanhar prazos e produtividade."
      footerText="Ainda nao tem conta?"
      footerLabel="Criar cadastro"
      footerHref="/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}
