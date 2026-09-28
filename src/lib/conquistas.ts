export const AVISO_CATALOGO_VAZIO =
  "Página sendo atualizada – consulte o Guia de Especialidades e Insígnias";

export type StatusConquista = "sem_itens" | "nao_iniciado" | "em_andamento" | "nivel_1" | "nivel_2";
export type TipoConquista = "especialidade" | "insignia";

/** Nível 1 = pelo menos a metade dos itens; Nível 2 = 100%. */
export function statusConquista(feitos: number, total: number): StatusConquista {
  if (total <= 0) return "sem_itens";
  if (feitos <= 0) return "nao_iniciado";
  if (feitos >= total) return "nivel_2";
  if (feitos * 2 >= total) return "nivel_1";
  return "em_andamento";
}

export function mensagemConquista(tipo: TipoConquista, status: StatusConquista): string | null {
  const alvo = tipo === "especialidade" ? "Especialidade" : "Insígnia";
  if (status === "nivel_1") return `${alvo} conquistada - Nível 1`;
  if (status === "nivel_2") return `${alvo} conquistada - Nível 2`;
  return null;
}

export function visualConquista(status: StatusConquista) {
  switch (status) {
    case "nivel_2":
      return {
        label: "Nível 2",
        card: "border-ouro/70 bg-ouro/10",
        badge: "bg-ouro text-ouro-foreground hover:bg-ouro",
        barra: "bg-ouro",
        trilha: "bg-ouro/25",
      };
    case "nivel_1":
      return {
        label: "Nível 1",
        card: "border-prata/70 bg-prata/15",
        badge: "bg-prata text-prata-foreground hover:bg-prata",
        barra: "bg-prata",
        trilha: "bg-prata/30",
      };
    case "em_andamento":
      return {
        label: "Em andamento",
        card: "border-leaf/40 bg-leaf/5",
        badge: "bg-leaf text-leaf-foreground hover:bg-leaf",
        barra: "bg-leaf",
        trilha: "bg-leaf/20",
      };
    default:
      return {
        label: status === "sem_itens" ? "Em atualização" : "Não iniciado",
        card: "border-border",
        badge: "bg-muted text-muted-foreground hover:bg-muted",
        barra: "bg-muted-foreground/40",
        trilha: "bg-muted",
      };
  }
}
