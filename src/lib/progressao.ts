import { extDb, meuMembro, TABELAS } from "./ext.functions";
import type { Membro } from "./membro";

export async function fetchMeuMembro(): Promise<Membro | null> {
  const txt = await meuMembro();
  return JSON.parse(txt) as Membro | null;
}

// Todos os dados vêm do banco oficial da tropa (projeto externo),
// acessado por funções no servidor.

export type Perfil = "escoteiro" | "chefe";

export type Jovem = {
  id: string;
  nome: string;
  patrulha: string | null;
  registro_ueb?: string | null;
  email?: string | null;
  perfil?: string;
};

export type ItemAcolhida = { id: string; ordem: number; titulo: string; descricao: string | null };
export type AcolhidaProgresso = {
  id: string;
  jovem_id: string;
  item_id: string;
  data_realizacao: string;
  validado_por: string | null;
};
export type Eixo = { id: string; nome: string; cor: string; ordem: number };
export type Bloco = {
  id: string;
  eixo_id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  meta_variaveis: number;
};
export type AcaoProgresso = {
  id: string;
  jovem_id: string;
  acao_id: string;
  data_realizacao: string;
  validado_por: string | null;
};
export type Promessa = { id: string; jovem_id: string; liberada_em: string; liberada_por: string | null };

export type TipoAcao = "FIXA" | "VARIAVEL" | "OU";
export type AcaoCatalogo = {
  id: string;
  bloco_id: string;
  tipo: TipoAcao;
  numero: number;
  descricao: string;
};
export type StatusBloco = {
  escoteiro_id: string;
  bloco_id: string;
  bloco_nome: string;
  todas_fixas_concluidas: boolean;
  variaveis_concluidas: number;
  meta_variaveis: number;
  acao_ou_concluida: boolean;
  atalho_conquistado: boolean;
  bloco_concluido: boolean;
};

type Row = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Tabela = (typeof TABELAS)[number];

const sel = (tabela: Tabela, filtros?: Record<string, string | number>) =>
  extDb({ data: { op: "select", tabela, filtros } }).then((t) => JSON.parse(t) as Row[]);

const CORES = ["azul", "verde", "dourado", "azul"];

type EscoteiroRow = {
  id: string;
  nome_completo: string;
  patrulha: string | null;
  registro_ueb: string | null;
  perfil: string | null;
  data_promessa: string | null;
  email: string | null;
};

async function fetchEscoteiros() {
  return (await sel("escoteiros")) as EscoteiroRow[];
}

export async function fetchJovens(): Promise<Jovem[]> {
  const rows = await fetchEscoteiros();
  return rows
    .filter((r) => (r.perfil ?? "ESCOTEIRO").toUpperCase() !== "CHEFE")
    .map((r) => ({
      id: r.id,
      nome: r.nome_completo,
      patrulha: r.patrulha,
      registro_ueb: r.registro_ueb,
      email: r.email ?? null,
      perfil: r.perfil ?? "ESCOTEIRO",
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function fetchAcolhidaCatalogo(): Promise<ItemAcolhida[]> {
  const rows = await sel("acolhida_catalogo");
  return rows
    .map((r) => ({ id: String(r.id), ordem: Number(r.id), titulo: r.descricao as string, descricao: null }))
    .sort((a, b) => a.ordem - b.ordem);
}

export async function fetchAcolhidaProgresso(jovemId?: string): Promise<AcolhidaProgresso[]> {
  const rows = await sel("acolhida_progresso", jovemId ? { escoteiro_id: jovemId } : undefined);
  return rows.map((r) => ({
    id: r.id,
    jovem_id: r.escoteiro_id,
    item_id: String(r.item_id),
    data_realizacao: r.data_conclusao,
    validado_por: r.validado_por,
  }));
}

export async function fetchEixos(): Promise<Eixo[]> {
  const rows = await sel("eixos");
  const ordemOficial = ["EIXO_HABILIDADES"];
  return rows
    .sort((a, b) => {
      const ia = ordemOficial.indexOf(a.id), ib = ordemOficial.indexOf(b.id);
      if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return String(a.nome).localeCompare(String(b.nome), "pt-BR");
    })
    .map((r, i) => ({ id: r.id, nome: r.nome, cor: CORES[i % CORES.length] ?? "azul", ordem: i + 1 }));
}

export async function fetchBlocos(): Promise<Bloco[]> {
  const rows = await sel("blocos");
  return rows
    .sort((a, b) => String(a.id).localeCompare(String(b.id), "pt-BR", { numeric: true }))
    .map((r, i) => ({
      id: r.id,
      eixo_id: r.eixo_id,
      nome: r.nome,
      descricao: null,
      ordem: i + 1,
      meta_variaveis: Number(r.meta_variaveis ?? 0),
    }));
}

export async function fetchAcoesCatalogo(blocoId?: string): Promise<AcaoCatalogo[]> {
  const rows = await sel("acoes_catalogo", blocoId ? { bloco_id: blocoId } : undefined);
  const ordemTipo: Record<string, number> = { FIXA: 0, VARIAVEL: 1, OU: 2 };
  return (rows as AcaoCatalogo[]).sort(
    (a, b) =>
      a.bloco_id.localeCompare(b.bloco_id, "pt-BR", { numeric: true }) ||
      (ordemTipo[a.tipo] ?? 9) - (ordemTipo[b.tipo] ?? 9) ||
      a.numero - b.numero,
  );
}

export async function fetchStatusBlocos(jovemId?: string): Promise<StatusBloco[]> {
  const f = jovemId ? { escoteiro_id: jovemId } : undefined;
  const [status, prog] = await Promise.all([sel("vw_status_blocos", f), sel("vw_progresso_blocos", f)]);
  const extra = new Map(prog.map((p) => [`${p.escoteiro_id}|${p.bloco_id}`, p]));
  return status.map((s) => {
    const p = extra.get(`${s.escoteiro_id}|${s.bloco_id}`);
    return {
      escoteiro_id: s.escoteiro_id,
      bloco_id: s.bloco_id,
      bloco_nome: s.bloco_nome,
      todas_fixas_concluidas: !!s.todas_fixas_concluidas,
      variaveis_concluidas: Number(s.variaveis_concluidas ?? 0),
      meta_variaveis: Number(s.meta_variaveis ?? 0),
      acao_ou_concluida: !!p?.acao_ou_concluida,
      atalho_conquistado: !!p?.atalho_conquistado,
      bloco_concluido: !!s.bloco_concluido,
    };
  });
}

export async function fetchAcoesProgresso(jovemId?: string): Promise<AcaoProgresso[]> {
  const rows = await sel("progresso_acoes", jovemId ? { escoteiro_id: jovemId } : undefined);
  return rows.map((r) => ({
    id: r.id,
    jovem_id: r.escoteiro_id,
    acao_id: r.acao_id,
    data_realizacao: r.data_conclusao,
    validado_por: r.validado_por,
  }));
}

export async function fetchPromessas(): Promise<Promessa[]> {
  const rows = await fetchEscoteiros();
  return rows
    .filter((r) => r.data_promessa)
    .map((r) => ({ id: r.id, jovem_id: r.id, liberada_em: r.data_promessa as string, liberada_por: null }));
}

export async function marcarAcolhida(input: { jovemId: string; itemId: string; data: string; validadoPor: string }) {
  await desmarcarAcolhida(input.jovemId, input.itemId);
  await extDb({
    data: {
      op: "insert",
      tabela: "acolhida_progresso",
      valores: {
        escoteiro_id: input.jovemId,
        item_id: Number(input.itemId),
        data_conclusao: input.data,
        validado_por: input.validadoPor || null,
      },
    },
  });
}

export async function desmarcarAcolhida(jovemId: string, itemId: string) {
  await extDb({
    data: { op: "delete", tabela: "acolhida_progresso", filtros: { escoteiro_id: jovemId, item_id: Number(itemId) } },
  });
}

export async function marcarAcao(input: { jovemId: string; acaoId: string; data: string; validadoPor: string }) {
  await desmarcarAcao(input.jovemId, input.acaoId);
  await extDb({
    data: {
      op: "insert",
      tabela: "progresso_acoes",
      valores: {
        escoteiro_id: input.jovemId,
        acao_id: input.acaoId,
        data_conclusao: input.data,
        validado_por: input.validadoPor || null,
      },
    },
  });
}

export async function desmarcarAcao(jovemId: string, acaoId: string) {
  await extDb({
    data: { op: "delete", tabela: "progresso_acoes", filtros: { escoteiro_id: jovemId, acao_id: acaoId } },
  });
}

export async function liberarPromessa(jovemId: string, _liberadaPor: string, data: string) {
  await extDb({ data: { op: "update", tabela: "escoteiros", filtros: { id: jovemId }, valores: { data_promessa: data } } });
}

export async function removerPromessa(jovemId: string) {
  await extDb({ data: { op: "update", tabela: "escoteiros", filtros: { id: jovemId }, valores: { data_promessa: null } } });
}

export async function criarJovem(dados: {
  nome: string;
  patrulha?: string | null;
  registro_ueb?: string | null;
  email?: string | null;
  perfil?: string;
}) {
  await extDb({
    data: {
      op: "insert",
      tabela: "escoteiros",
      valores: {
        nome_completo: dados.nome,
        patrulha: dados.patrulha || null,
        registro_ueb: dados.registro_ueb || null,
        email: dados.email ? dados.email.trim().toLowerCase() : null,
        perfil: dados.perfil || "ESCOTEIRO",
      },
    },
  });
}

export async function atualizarJovem(
  id: string,
  nome: string,
  patrulha: string,
  registroUeb?: string,
  email?: string,
) {
  const valores: Record<string, unknown> = { nome_completo: nome, patrulha: patrulha || null };
  if (registroUeb !== undefined) valores["registro_ueb"] = registroUeb || null;
  if (email !== undefined) valores["email"] = email ? email.trim().toLowerCase() : null;
  await extDb({ data: { op: "update", tabela: "escoteiros", filtros: { id }, valores } });
}

export async function removerJovem(id: string) {
  await extDb({ data: { op: "delete", tabela: "acolhida_progresso", filtros: { escoteiro_id: id } } });
  await extDb({ data: { op: "delete", tabela: "progresso_acoes", filtros: { escoteiro_id: id } } });
  await extDb({ data: { op: "delete", tabela: "escoteiros", filtros: { id } } });
}

export const hoje = () => new Date().toISOString().slice(0, 10);

export function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
