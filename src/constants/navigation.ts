import {
  BarChart3,
  Calculator,
  FolderKanban,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AppNavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const appNavigationItems: AppNavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Calcular Prazo",
    href: "/calcular-prazo",
    icon: Calculator,
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
  },
  {
    title: "Estatisticas",
    href: "/estatisticas",
    icon: BarChart3,
  },
  {
    title: "Configuracoes",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function getNavigationTitle(pathname: string) {
  return (
    appNavigationItems.find((item) => pathname.startsWith(item.href))?.title ??
    "Dashboard"
  );
}
