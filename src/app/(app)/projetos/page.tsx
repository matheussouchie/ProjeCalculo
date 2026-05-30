import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { ProjectHistoryList } from "@/components/analytics/project-history-list";
import { Button } from "@/components/ui/button";
import { getCurrentUserAnalytics } from "@/services/analytics/user-analytics.queries";

export default async function ProjectsPage() {
  const { projects } = await getCurrentUserAnalytics();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2>Projetos</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Consulte estimativas e entregas concluídas em um histórico simples, sem
            tabelas pesadas.
          </p>
        </div>
        <Button asChild>
          <Link href="/registrar-projeto-concluido">
            <CheckCircle2 aria-hidden="true" />
            Registrar Projeto Concluído
          </Link>
        </Button>
      </div>

      <ProjectHistoryList projects={projects} title="Histórico de projetos" />
    </section>
  );
}
