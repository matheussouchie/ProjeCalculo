import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const overview = [
  { label: "Projetos ativos", value: "0" },
  { label: "Prazo medio", value: "--" },
  { label: "Precisao historica", value: "--" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Sprint 3</Badge>
          <h2 className="mt-4">Visao geral</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Shell principal criado para receber os fluxos de calculo, projetos e
            estatisticas nas proximas sprints.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {overview.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[32px] font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="min-h-[380px]">
        <CardHeader>
          <CardTitle>Workspace pronto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/40 p-6">
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Autenticacao, rotas protegidas, sidebar, header e base visual foram
              estabelecidos. A partir daqui, cada feature entra dentro deste shell.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
