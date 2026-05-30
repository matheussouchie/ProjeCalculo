import Image from "next/image";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <Image
        src="/images/login-background.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-white/10 to-background/70" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/20 bg-card/95 shadow-[var(--shadow-soft)] backdrop-blur-xl md:grid-cols-[1fr_420px]">
        <div className="hidden p-8 text-foreground md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-8 flex size-12 items-center justify-center rounded-md border border-white/25 bg-white/90 p-2 shadow-[var(--shadow-card)]">
              <Image
                src="/icons/projecalculo-icon.svg"
                alt="Icone ProjeCalculo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <Badge className="border-white/20 bg-white/90 text-foreground">
              ProjeCalculo
            </Badge>
            <h1 className="mt-6 max-w-sm text-foreground">
              Prazos precisos para projetos de detalhamento.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Uma base profissional para arquitetos, designers de interiores e
              projetistas acompanharem produtividade real.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">ProjeCalculo · Auth seguro</p>
        </div>

        <Card className="rounded-none border-0 shadow-none">
          <CardHeader>
            <div className="mb-3 flex items-center gap-3 md:hidden">
              <span className="flex size-10 items-center justify-center rounded-md border bg-card p-2 shadow-[var(--shadow-card)]">
                <Image
                  src="/icons/projecalculo-icon.svg"
                  alt="Icone ProjeCalculo"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  priority
                />
              </span>
              <Badge variant="outline">ProjeCalculo</Badge>
            </div>
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
