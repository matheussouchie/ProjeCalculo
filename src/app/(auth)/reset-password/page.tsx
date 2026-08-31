import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Nova senha" description="Defina uma senha segura para voltar ao .">
      <ResetPasswordForm />
    </AuthCard>
  );
}
