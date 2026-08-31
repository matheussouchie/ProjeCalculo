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
      title="Realize Seu Login"
      description="Acesse seu espaço para acompanhar prazos, produtividade e calcular novos projetos."
      footerText="Ainda não possui conta?"
      footerLabel="Criar Cadastro"
      footerHref="/signup"
    >
      <LoginForm />
    </AuthCard>
  );
}
