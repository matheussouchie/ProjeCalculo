export const notificationMessages = {
  autosaved: "Projeto salvo automaticamente",
  saved: "Projeto salvo com sucesso",
  updated: "Projeto atualizado com sucesso",
  deleted: "Projeto excluído com sucesso",
  saveError: "Erro ao salvar projeto",
  offline: "Sem conexão. Alterações serão sincronizadas quando a internet retornar.",
  connectionFailed: "Falha de conexão detectada",
  draftFound: "Encontramos um rascunho salvo automaticamente.",
  draftRestored: "Rascunho restaurado com sucesso",
} as const;

export type NotificationTone = "success" | "error" | "warning" | "info";
