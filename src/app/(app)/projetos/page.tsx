import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2>Projetos</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Acompanhe projetos estimados e registre entregas concluídas para melhorar as
            próximas previsões.
          </p>
        </div>
        <Button asChild>
          <Link href="/registrar-projeto-concluido">
            <CheckCircle2 aria-hidden="true" />
            Registrar Projeto Concluído
          </Link>
        </Button>
      </div>

      <Card className="min-h-[360px] justify-center">
        <CardHeader>
          <CardTitle>Histórico em construção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Use o registro de projeto concluído para alimentar a produtividade real. Nas
            próximas sprints, esta área exibirá o histórico completo.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
