import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyAnalyticsState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-primary/5 text-primary">
          <ChartNoAxesCombined className="size-5" aria-hidden="true" />
        </div>
        <h3 className="mt-6">Dados em formação</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Registre projetos concluídos para o ProjeCalculo aprender sua produtividade
          real e montar gráficos mais precisos.
        </p>
        <Button asChild className="mt-6">
          <Link href="/registrar-projeto-concluido">Registrar Projeto Concluído</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
