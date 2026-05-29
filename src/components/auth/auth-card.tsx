import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footerHref?: string;
  footerLabel?: string;
  footerText?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footerHref,
  footerLabel,
  footerText,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-card shadow-[var(--shadow-soft)] md:grid-cols-[1fr_420px]">
        <div className="hidden bg-muted/40 p-8 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-10 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              PC
            </div>
            <Badge variant="secondary">ProjeCalculo</Badge>
            <h1 className="mt-6 max-w-sm">
              Prazos precisos para projetos de detalhamento.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Uma base profissional para arquitetos, designers de interiores e
              projetistas acompanharem produtividade real.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Sprint 3 · Auth e shell principal
          </p>
        </div>

        <Card className="rounded-none border-0 shadow-none">
          <CardHeader>
            <Badge variant="outline" className="mb-3 w-fit md:hidden">
              ProjeCalculo
            </Badge>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {children}
            {footerHref && footerLabel && footerText ? (
              <p className="text-center text-sm text-muted-foreground">
                {footerText}{" "}
                <Link
                  className="font-medium text-foreground hover:underline"
                  href={footerHref}
                >
                  {footerLabel}
                </Link>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
