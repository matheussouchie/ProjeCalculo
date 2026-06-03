"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmailConfirmationScreenProps = {
  variant: "loading" | "success" | "error";
  detail?: string;
};

const contentByVariant = {
  loading: {
    title: "Confirmando sua conta...",
    description: "Estamos validando seu cadastro.",
    icon: Loader2,
    iconClassName:
      "border-border/60 bg-muted text-muted-foreground animate-spin",
    actionLabel: null,
    message: null,
  },
  success: {
    title: "Conta confirmada com sucesso",
    description: "Seu cadastro foi ativado.",
    icon: CheckCircle2,
    iconClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    actionLabel: "Ir para Login",
    message: "Agora você já pode acessar sua conta normalmente.",
  },
  error: {
    title: "Não foi possível confirmar sua conta",
    description:
      "O link pode ter expirado ou já ter sido utilizado.",
    icon: AlertCircle,
    iconClassName:
      "border-destructive/20 bg-destructive/10 text-destructive",
    actionLabel: "Voltar para Login",
    message: null,
  },
} as const;

export function EmailConfirmationScreen({
  variant,
  detail,
}: EmailConfirmationScreenProps) {
  const content = contentByVariant[variant];
  const Icon = content.icon;

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
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-background/75" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[20px] border border-white/20 bg-card/95 shadow-[var(--shadow-soft)] backdrop-blur-xl md:grid-cols-[1fr_420px]">
        <aside className="hidden flex-col justify-between p-8 text-foreground md:flex">
          <div>
            <div className="mb-8 flex size-12 items-center justify-center rounded-[16px] border border-white/25 bg-white/90 p-2 shadow-[var(--shadow-card)]">
              <Image
                src="/branding/icon.svg"
                alt="OnTime²"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <Badge className="border-white/20 bg-white/90 text-foreground">
              OnTime²
            </Badge>
            <h1 className="mt-6 max-w-sm text-foreground">
              Seu acesso está sendo validado com segurança.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Mantemos a experiência simples, profissional e protegida para que
              você retome seu trabalho sem atrito.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            OnTime² · Fluxo seguro de autenticação
          </p>
        </aside>

        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3 md:hidden">
              <span className="flex size-10 items-center justify-center rounded-[12px] border bg-card p-2 shadow-[var(--shadow-card)]">
                <Image
                  src="/branding/icon.svg"
                  alt="OnTime²"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  priority
                />
              </span>
              <Badge variant="outline">OnTime²</Badge>
            </div>
            <motion.div
              key={variant}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="space-y-2"
            >
              <CardTitle className="text-2xl">{content.title}</CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5">
            <motion.div
              key={`${variant}-panel`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className={cn(
                "rounded-[16px] border p-5",
                variant === "loading" && "border-border/60 bg-muted/40",
                variant === "success" &&
                  "border-emerald-500/20 bg-emerald-500/5",
                variant === "error" && "border-destructive/20 bg-destructive/5",
              )}
            >
              <div className="flex items-start gap-4">
                <span className={cn("flex size-11 items-center justify-center rounded-full border", content.iconClassName)}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {variant === "loading"
                      ? "Aguarde um instante"
                      : variant === "success"
                        ? content.message
                        : content.description}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {variant === "loading"
                      ? "A confirmação acontece em segundo plano. Se o link estiver válido, o acesso será liberado automaticamente."
                      : variant === "error"
                        ? detail ?? "Abra novamente o link mais recente enviado para o seu e-mail."
                        : content.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {variant !== "loading" ? (
              <Button asChild className="w-full h-11 rounded-[12px]">
                <Link href="/login">{content.actionLabel}</Link>
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-[12px] border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Confirmando sua conta...
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

