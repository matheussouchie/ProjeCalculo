import { ProjectHistoryList } from "@/components/analytics/project-history-list";
import { getCurrentUserAnalytics } from "@/services/analytics/user-analytics.queries";

export default async function ProjectsPage() {
  const { projects } = await getCurrentUserAnalytics();

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Projetos</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Consulte estimativas e entregas concluídas em um histórico simples, sem
          tabelas pesadas.
        </p>
      </div>

      <ProjectHistoryList
        projects={projects}
        title="Histórico de projetos"
        showActions
      />
    </section>
  );
}
