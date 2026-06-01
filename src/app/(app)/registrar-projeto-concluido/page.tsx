import { RegisterCompletedProjectForm } from "@/components/completed-project/register-completed-project-form";
import type { CompletedProjectValues } from "@/lib/completed-project-schema";
import { getCurrentUserDraft } from "@/services/drafts/drafts.queries";
import { getCurrentUserActiveRoomOptions } from "@/services/user-rooms/user-rooms.queries";

export default async function RegisterCompletedProjectPage() {
  const roomOptions = await getCurrentUserActiveRoomOptions();
  const draft = await getCurrentUserDraft<CompletedProjectValues>("completed_project");

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Registrar Projeto Concluído</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Informe os ambientes, metragens e dias reais para o sistema aprender com o seu
          histórico.
        </p>
      </div>

      <RegisterCompletedProjectForm roomOptions={roomOptions} draft={draft} />
    </section>
  );
}
