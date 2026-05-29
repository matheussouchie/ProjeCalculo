import Image from "next/image";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-md border bg-card p-2 shadow-[var(--shadow-card)]">
        <Image
          src="/icons/projecalculo-icon.svg"
          alt="Icone ProjeCalculo"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
      </div>
      <div className="min-w-0">
        <Image
          src="/logo/projecalculo-logo.svg"
          alt="ProjeCalculo"
          width={150}
          height={28}
          className="h-7 w-auto max-w-[150px] object-contain object-left"
          priority
        />
        <p className="mt-1 text-xs text-muted-foreground">Prazos profissionais</p>
      </div>
    </div>
  );
}
