import { RegisterCompletedProjectForm } from "@/components/completed-project/register-completed-project-form";
import type { CompletedProjectValues } from "@/lib/completed-project-schema";
import { getCurrentUserDraft } from "@/services/drafts/drafts.queries";
import { getCurrentUserSavedEstimates } from "@/services/estimates/saved-estimates.queries";
import { getCurrentUserProjectForEditing } from "@/services/projects/projects.queries";
import { getCurrentUserActiveRoomOptions } from "@/services/user-rooms/user-rooms.queries";

type RegisterCompletedProjectPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function RegisterCompletedProjectPage({
  searchParams,
}: RegisterCompletedProjectPageProps) {
  const roomOptions = await getCurrentUserActiveRoomOptions();
  const savedEstimates = await getCurrentUserSavedEstimates();
  const rawProjectId = searchParams?.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]?.trim()
    : rawProjectId?.trim();
  const initialProject =
    projectId ? await getCurrentUserProjectForEditing(projectId) : null;
  const draft = projectId
    ? null
    : await getCurrentUserDraft<CompletedProjectValues>("completed_project");

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Registrar Projeto Concluído</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Informe os ambientes, metragens e dias reais para o sistema aprender com o seu
          histórico.
        </p>
      </div>

      <RegisterCompletedProjectForm
        key={initialProject?.projectId ?? projectId ?? "new"}
        roomOptions={roomOptions}
        savedEstimates={savedEstimates}
        draft={draft}
        initialProject={initialProject}
      />
    </section>
  );
}

