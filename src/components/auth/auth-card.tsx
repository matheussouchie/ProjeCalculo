import Image from "next/image";
import Link from "next/link";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-8 lg:p-[50px]">
      <Image
        src="/images/login-background.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-white/45 dark:bg-[#52395e]/45" />

      <section className="relative grid w-full max-w-[1400px] overflow-hidden rounded-md border border-[#80658c] bg-[#f5f1f7] shadow-[var(--shadow-soft)] lg:grid-cols-2">
        <div className="hidden min-h-[650px] flex-col justify-between px-12 py-10 text-[#52395e] lg:flex">
          <div>
            <Image
              src="/branding/ontime-mark.png"
              alt="OnTime²"
              width={2000}
              height={2000}
              className="size-[220px] object-contain"
              priority
            />
            <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[1.2]">
              Prazos precisos para projetos de detalhamento.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-5">
            Uma base profissional para arquitetos, designers de interiores e projetistas
            acompanharem produtividade real.
          </p>
        </div>

        <Card className="min-h-[620px] justify-center rounded-none border-0 bg-white px-2 py-10 shadow-none dark:bg-[#53575e] sm:px-8 lg:px-16 lg:py-[70px]">
          <CardHeader className="px-5 sm:px-6">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <Image
                src="/branding/ontime-mark.png"
                alt="OnTime²"
                width={2000}
                height={2000}
                className="size-16 object-contain"
                priority
              />
              <span className="text-xl font-semibold text-[#52395e] dark:text-[#f5f1f7]">
                OnTime²
              </span>
            </div>
            <CardTitle className="text-4xl font-bold text-[#52395e] dark:text-[#f5f1f7]">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-5">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-5 sm:px-6">
            {children}
            {footerHref && footerLabel && footerText ? (
              <p className="text-center text-base text-muted-foreground">
                {footerText}{" "}
                <Link
                  className="font-semibold text-primary hover:underline dark:text-[#f0c4a3]"
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
