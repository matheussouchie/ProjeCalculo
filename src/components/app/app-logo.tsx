import Image from "next/image";

export function AppLogo() {
  return (
    <div className="min-w-0">
      <Image
        src="/logo/projecalculo-logo.svg"
        alt="OnTime²"
        width={170}
        height={32}
        className="h-8 w-auto max-w-[170px] object-contain object-left"
        priority
      />
      <p className="mt-2 text-xs text-muted-foreground">Prazos profissionais</p>
    </div>
  );
}

