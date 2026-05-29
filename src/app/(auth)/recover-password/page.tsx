import { AuthCard } from "@/components/auth/auth-card";
import { RecoverPasswordForm } from "@/components/auth/recover-password-form";

export default function RecoverPasswordPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      description="Receba um link seguro para definir uma nova senha."
      footerText="Lembrou sua senha?"
      footerLabel="Entrar"
      footerHref="/login"
    >
      <RecoverPasswordForm />
    </AuthCard>
  );
}
