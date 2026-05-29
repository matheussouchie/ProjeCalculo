import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Criar conta"
      description="Cadastre seu studio e comece com uma base inicial de produtividade."
      footerText="Ja tem conta?"
      footerLabel="Entrar"
      footerHref="/login"
    >
      <SignupForm />
    </AuthCard>
  );
}
