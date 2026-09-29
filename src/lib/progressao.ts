import { supabase } from "./supabase";
import type { Membro } from "./membro";

export type { Membro };

export async function fetchMeuMembro(): Promise<Membro | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("escoteiros")
    .select("*")
    .eq("email", user.email)
    .single();

  if (error || !data) return null;
  return data as Membro;
}

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

export type EstagioNome = "PISTAS" | "TRILHA" | "RUMO" | "TRAVESSIA";

export type EscoteiroEstagio = {
  id: string;
  escoteiro_id: string;
  estagio: EstagioNome;
  data_conclusao: string | null;
  registrado_por: string | null;
};

export type EspecialidadeProgresso = {
  id: string;
  nome: string;
  categoria_id?: string;
  nivel: number;
  concluida: boolean;
  [key: string]: any;
};

const CORES_EIXOS: Record<string, string> = {
  EIXO_HABILIDADES: "azul",
  EIXO_MEIO_AMBIENTE: "verde",
  EIXO_PAZ: "dourado",
  EIXO_SAUDE: "vermelho",
};

const ORDEM_EIXOS_OFICIAL = [
  "EIXO_HABILIDADES",
  "EIXO_MEIO_AMBIENTE",
  "EIXO_PAZ",
  "EIXO_SAUDE",
];

type EscoteiroRow = {
  id: string;
  nome_completo: string;
  patrulha: string | null;
  registro_ueb: string | null;
  perfil: string | null;
  data_promessa: string | null;
  email: string | null;
};

export async function fetchEscoteiros() {
  const { data, error } = await supabase.from("escoteiros").select("*");
  if (error) throw error;
  return (data || []) as EscoteiroRow[];
}

export async function fetchJovens(): Promise<Jovem[]> {
  const rows = await fetchEscoteiros();
  return rows
    .filter((r) => (r.perfil ?? "ESCOTEIRO").toUpperCase() !== "CHEFE")
    .map((r) => ({
      id: r.id ?? "",
      nome: r.nome_completo,
      patrulha: r.patrulha,
      registro_ueb: r.registro_ueb,
      email: r.email ?? null,
      perfil: r.perfil ?? "ESCOTEIRO",
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function fetchAcolhidaCatalogo(): Promise<ItemAcolhida[]> {
  const { data, error } = await supabase.from("acolhida_catalogo").select("*");
  if (error) throw error;
  return (data || [])
    .map((r: any) => ({ id: String(r.id), ordem: Number(r.id), titulo: r.descricao as string, descricao: null }))
    .sort((a, b) => a.ordem - b.ordem);
}

export async function fetchAcolhidaProgresso(jovemId?: string): Promise<AcolhidaProgresso[]> {
  let query = supabase.from("acolhida_progresso").select("*");
  if (jovemId) query = query.eq("escoteiro_id", jovemId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id ?? "",
    jovem_id: r.escoteiro_id,
    item_id: String(r.item_id),
    data_realizacao: r.data_conclusao,
    validado_por: r.validado_por,
  }));
}

export async function fetchEixos(): Promise<Eixo[]> {
  const { data, error } = await supabase.from("eixos").select("*");
  if (error) throw error;
  return (data || [])
    .sort((a: any, b: any) => {
      const ia = ORDEM_EIXOS_OFICIAL.indexOf(a.id);
      const ib = ORDEM_EIXOS_OFICIAL.indexOf(b.id);
      if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return String(a.nome).localeCompare(String(b.nome), "pt-BR");
    })
    .map((r: any, i: number) => ({
      id: r.id ?? "",
      nome: r.nome,
      cor: CORES_EIXOS[r.id] ?? "azul",
      ordem: i + 1,
    }));
}

export async function fetchBlocos(): Promise<Bloco[]> {
  const { data, error } = await supabase.from("blocos").select("*");
  if (error) throw error;
  return (data || [])
    .sort((a: any, b: any) => String(a.id).localeCompare(String(b.id), "pt-BR", { numeric: true }))
    .map((r: any, i: number) => ({
      id: r.id ?? "",
      eixo_id: r.eixo_id,
      nome: r.nome,
      descricao: null,
      ordem: i + 1,
      meta_variaveis: Number(r.meta_variaveis ?? 0),
    }));
}

export async function fetchAcoesCatalogo(blocoId?: string): Promise<AcaoCatalogo[]> {
  let query = supabase.from("acoes_catalogo").select("*");
  if (blocoId) query = query.eq("bloco_id", blocoId);
  const { data, error } = await query;
  if (error) throw error;
  
  const ordemTipo: Record<string, number> = { FIXA: 0, VARIAVEL: 1, OU: 2 };
  return (data as AcaoCatalogo[]).sort(
    (a, b) =>
      a.bloco_id.localeCompare(b.bloco_id, "pt-BR", { numeric: true }) ||
      (ordemTipo[a.tipo] ?? 9) - (ordemTipo[b.tipo] ?? 9) ||
      a.numero - b.numero,
  );
}

export async function fetchStatusBlocos(jovemId?: string): Promise<StatusBloco[]> {
  let qStatus = supabase.from("vw_status_blocos").select("*");
  let qProg = supabase.from("vw_progresso_blocos").select("*");
  
  if (jovemId) {
    qStatus = qStatus.eq("escoteiro_id", jovemId);
    qProg = qProg.eq("escoteiro_id", jovemId);
  }

  const [{ data: status }, { data: prog }] = await Promise.all([qStatus, qProg]);
  
  const extra = new Map((prog || []).map((p: any) => [`${p.escoteiro_id}|${p.bloco_id}`, p]));
  return (status || []).map((s: any) => {
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
  let query = supabase.from("progresso_acoes").select("*");
  if (jovemId) query = query.eq("escoteiro_id", jovemId);
  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id ?? "",
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
    .map((r) => ({ id: r.id ?? "", jovem_id: r.id ?? "", liberada_em: r.data_promessa as string, liberada_por: null }));
}

export async function fetchEstagiosProgresso(jovemId?: string): Promise<EscoteiroEstagio[]> {
  let query = supabase.from("escoteiros_estagios").select("*");
  if (jovemId) query = query.eq("escoteiro_id", jovemId);
  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r['id'] ?? "",
    escoteiro_id: r['escoteiro_id'] ?? "",
    estagio: r['estagio'],
    data_conclusao: r['data_conclusao'] ?? null,
    registrado_por: r['registrado_por'] ?? null,
  }));
}

export async function registrarEstagio(input: {
  escoteiroId: string;
  estagio: EstagioNome;
  data: string | null;
  registradoPor?: string;
}) {
  const { error } = await supabase.from("escoteiros_estagios").insert({
    escoteiro_id: input.escoteiroId,
    estagio: input.estagio,
    data_conclusao: input.data || null,
    registrado_por: input.registradoPor || null,
  });
  if (error) throw error;
}

export async function fetchEspecProgressoCompleto(jovemId: string): Promise<EspecialidadeProgresso[]> {
  const { data, error } = await supabase.from("especialidades_progresso").select("*").eq("escoteiro_id", jovemId);
  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r['id'] ?? "",
    nome: r['nome'] ?? "",
    nivel: Number(r['nivel'] ?? 0),
    concluida: !!r['concluida'],
    ...r,
  }));
}
export const fetchEspecialidadesProgresso = fetchEspecProgressoCompleto;

export async function marcarAcolhida(input: { jovemId: string; itemId: string; data: string; validadoPor: string }) {
  await desmarcarAcolhida(input.jovemId, input.itemId);
  const { error } = await supabase.from("acolhida_progresso").insert({
    escoteiro_id: input.jovemId,
    item_id: Number(input.itemId),
    data_conclusao: input.data,
    validado_por: input.validadoPor || null,
  });
  if (error) throw error;
}

export async function desmarcarAcolhida(jovemId: string, itemId: string) {
  const { error } = await supabase
    .from("acolhida_progresso")
    .delete()
    .eq("escoteiro_id", jovemId)
    .eq("item_id", Number(itemId));
  if (error) throw error;
}

export async function marcarAcao(input: { jovemId: string; acaoId: string; data: string; validadoPor: string }) {
  await desmarcarAcao(input.jovemId, input.acaoId);
  const { error } = await supabase.from("progresso_acoes").insert({
    escoteiro_id: input.jovemId,
    acao_id: input.acaoId,
    data_conclusao: input.data,
    validado_por: input.validadoPor || null,
  });
  if (error) throw error;
}

export async function desmarcarAcao(jovemId: string, acaoId: string) {
  const { error } = await supabase
    .from("progresso_acoes")
    .delete()
    .eq("escoteiro_id", jovemId)
    .eq("acao_id", acaoId);
  if (error) throw error;
}

export async function liberarPromessa(jovemId: string, _liberadaPor: string, data: string) {
  const { error } = await supabase
    .from("escoteiros")
    .update({ data_promessa: data })
    .eq("id", jovemId);
  if (error) throw error;
}

export async function removerPromessa(jovemId: string) {
  const { error } = await supabase
    .from("escoteiros")
    .update({ data_promessa: null })
    .eq("id", jovemId);
  if (error) throw error;
}

export async function criarJovem(dados: {
  nome: string;
  patrulha?: string | null;
  registro_ueb?: string | null;
  email?: string | null;
  perfil?: string;
}) {
  const { error } = await supabase.from("escoteiros").insert({
    nome_completo: dados.nome,
    patrulha: dados.patrulha || null,
    registro_ueb: dados.registro_ueb || null,
    email: dados.email ? dados.email.trim().toLowerCase() : null,
    perfil: dados.perfil || "ESCOTEIRO",
  });
  if (error) throw error;
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
  
  const { error } = await supabase.from("escoteiros").update(valores).eq("id", id);
  if (error) throw error;
}

export async function removerJovem(id: string) {
  await supabase.from("acolhida_progresso").delete().eq("escoteiro_id", id);
  await supabase.from("progresso_acoes").delete().eq("escoteiro_id", id);
  const { error } = await supabase.from("escoteiros").delete().eq("id", id);
  if (error) throw error;
}

export const hoje = () => new Date().toISOString().slice(0, 10);

export function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export async function fetchInsigniasProgresso(jovemId?: string): Promise<any[]> {
  let query = supabase.from("progresso_insignias_itens" as any).select("*");
  if (jovemId) query = query.eq("escoteiro_id", jovemId);
  const { data, error } = await query;
  if (error) return []; // Retorna vazio se a tabela opcional não existir

  return (data || []).map((r: any) => ({
    id: r['id'] ?? "",
    jovem_id: r['escoteiro_id'] ?? jovemId,
    item_id: r['item_id'] ?? "",
    ...r,
  }));
}

export async function fetchInsigniasProgressoCompleto(jovemId: string): Promise<any[]> {
  return await fetchInsigniasProgresso(jovemId);
}

export const MAPA_EIXOS: Record<string, { nome: string; cor: string }> = {
  EIXO_HABILIDADES: { nome: "Habilidades para a Vida", cor: "azul" },
  EIXO_MEIO_AMBIENTE: { nome: "Meio Ambiente", cor: "verde" },
  EIXO_PAZ: { nome: "Paz e Desenvolvimento", cor: "dourado" },
  EIXO_SAUDE: { nome: "Saúde e Bem-estar", cor: "vermelho" },
};