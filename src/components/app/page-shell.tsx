import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <Card className="min-h-[360px] justify-center">
        <CardHeader>
          <CardTitle>Estrutura pronta</CardTitle>
        </CardHeader>
        <CardContent>
          {children ?? (
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Esta area ja esta protegida por autenticacao e preparada para receber as
              proximas funcionalidades do produto.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
