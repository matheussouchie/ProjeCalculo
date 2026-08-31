export type NavigationIconName =
  | "dashboard"
  | "calculator"
  | "rooms"
  | "projects"
  | "settings";

export type AppNavigationItem = {
  title: string;
  href: string;
  icon: NavigationIconName;
};

export const appNavigationItems: AppNavigationItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { title: "Calcular Prazo", href: "/calcular-prazo", icon: "calculator" },
  { title: "Ambientes", href: "/ambientes", icon: "rooms" },
  { title: "Projetos", href: "/projetos", icon: "projects" },
  { title: "Estatísticas", href: "/estatisticas", icon: "dashboard" },
  { title: "Configurações", href: "/configuracoes", icon: "settings" },
];

export function getNavigationTitle(pathname: string) {
  if (pathname.startsWith("/registrar-projeto-concluido")) {
    return "Registrar Projeto Concluído";
  }

  return (
    appNavigationItems.find((item) => pathname.startsWith(item.href))?.title ??
    "Dashboard"
  );
}
