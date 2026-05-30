import { RegisterCompletedProjectForm } from "@/components/completed-project/register-completed-project-form";

export default function RegisterCompletedProjectPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Registrar Projeto Concluído</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Informe os ambientes, metragens e dias reais para o sistema aprender com o seu
          histórico.
        </p>
      </div>

      <RegisterCompletedProjectForm />
    </section>
  );
}
