Agora o arquivo progressao.ts

src/lib/progressao.ts
Função hoje() (linha 135): Adicionar operador de coalescência ou asserção (?? "" / as string) para garantir que o retorno nunca seja undefined.
Interface Jovem: Declarar explicitamente a propriedade registro_ueb?: string | null; para evitar erro de assinatura de índice (noPropertyAccessFromIndexSignature).
Função salvarJovem (linhas 459-460): Acessar dados["id"] via colchetes em vez de ponto (dados.id).
Tipagens de retorno (fetchPromessas e fetchAcolhidaProgresso): Tratar campos opcionais (data_promessa, validado_por) para que o compilador não rejeite atribuições do tipo string | undefined.
Exportação de alias: Adicionar export const fetchEscoteiros = fetchJovens; para atender telas que importam com essa nomenclatura.

Codigo

"import { extDb, TABELAS } from "./ext.functions";

export type TabelaNome = (typeof TABELAS)[number];
export type Perfil = "escoteiro" | "chefe" | "ESCOTEIRO" | "CHEFE";
export type TipoAcao = "FIXA" | "VARIAVEL" | "fixa" | "variavel";

// --- TIPOS DE ENTIDADES OFICIAIS ---
export interface Jovem {
  id: string;
  nome?: string | null;
  nome_completo?: string | null;
  name?: string | null;
  patrulha?: string | null;
  data_nascimento?: string | null;
  promessa_liberada?: boolean;
  data_promessa?: string | null;
  email?: string | null;
  perfil?: Perfil | string;
  [key: string]: unknown;
}

export type Escoteiro = Jovem;

export interface Membro {
  id: string;
  nome?: string | null;
  nome_completo?: string | null;
  patrulha?: string | null;
  perfil?: Perfil | string;
  email?: string | null;
  promessa_liberada?: boolean;
  data_promessa?: string | null;
  [key: string]: unknown;
}

export interface ItemAcolhida {
  id: string;
  titulo?: string;
  descricao?: string;
  ordem?: number;
  [key: string]: unknown;
}

export interface AcolhidaProgresso {
  id?: string;
  escoteiro_id: string;
  jovem_id?: string;
  item_acolhida_id: string;
  item_id?: string;
  concluida: boolean;
  data_conclusao?: string;
  data_realizacao?: string;
  validado_por?: string;
  [key: string]: unknown;
}

export interface Eixo {
  id: string;
  nome: string;
  ordem?: number;
  [key: string]: unknown;
}

export interface Bloco {
  id: string;
  eixo_id: string;
  nome: string;
  ordem?: number;
  [key: string]: unknown;
}

export interface AcaoCatalogo {
  id: string;
  bloco_id: string;
  codigo?: string;
  descricao?: string;
  tipo?: TipoAcao;
  ordem?: number;
  [key: string]: unknown;
}

export interface StatusBloco {
  id?: string;
  bloco_id: string;
  escoteiro_id: string;
  [key: string]: unknown;
}

export interface Promessa {
  id: string;
  escoteiro_id?: string;
  jovem_id?: string;
  data_promessa?: string;
  liberada_em?: string;
  liberada_por?: string;
  promessa_liberada?: boolean;
  [key: string]: unknown;
}

// Mapeamento visual e amigável dos Eixos
export const MAPA_EIXOS: Record<string, { nome: string; ordem: number }> = {
  EIXO_HABILIDADES: { nome: "Habilidades para a Vida", ordem: 1 },
  EIXO_MEIO_AMBIENTE: { nome: "Meio Ambiente", ordem: 2 },
  EIXO_PAZ: { nome: "Paz e Desenvolvimento", ordem: 3 },
  EIXO_SAUDE: { nome: "Saúde e Bem-estar", ordem: 4 },
};

// Utilidade interna para consultas flexíveis
async function selQuiet<T = Record<string, unknown>>(
  tabela: TabelaNome | string,
  filtros?: Record<string, string | number | boolean>
): Promise<T[]> {
  try {
    const raw = await extDb({ data: { op: "select", tabela: tabela as TabelaNome, filtros } });
    return JSON.parse(raw) as T[];
  } catch (err) {
    console.error(`Erro ao buscar tabela ${tabela}:`, err);
    return [];
  }
}

// --- UTILITÁRIOS DE DATA ---
export function formatarData(data?: string | Date | null): string {
  if (!data) return "";
  try {
    const d = typeof data === "string" ? new Date(data) : data;
    if (isNaN(d.getTime())) return String(data);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return String(data);
  }
}

export function hoje(): string {
  return new Date().toISOString().split("T")[0];
}

// --- TIPOS DE PROGRESSÃO PAINEL ---
export interface AcaoProgresso {
  id: string;
  codigo: string;
  descricao: string;
  tipo: "FIXA" | "VARIAVEL";
  ordem: number;
  concluida: boolean;
  validadoPor?: string | null;
  validadoEm?: string | null;
}

export interface BlocoProgresso {
  id: string;
  eixoId: string;
  nome: string;
  ordem: number;
  fixasTotal: number;
  fixasConcluidas: number;
  variaveisTotal: number;
  variaveisConcluidas: number;
  acoes: AcaoProgresso[];
}

export interface EixoProgresso {
  id: string;
  nome: string;
  ordem: number;
  blocos: BlocoProgresso[];
}

export interface RequisitoEspecialidade {
  id: string;
  numeroItem: number;
  descricao: string;
  concluido: boolean;
  validadoPor?: string | null;
  validadoEm?: string | null;
}

export interface EspecialidadeProgresso {
  id: string;
  eixoId: string;
  eixoNome: string;
  nome: string;
  metaItensNivel1: number;
  requisitos: RequisitoEspecialidade[];
  concluidosCount: number;
  totalRequisitos: number;
  nivelAtual: 0 | 1 | 2;
}

export interface RequisitoInsignia {
  id: string;
  numeroItem: number;
  descricao: string;
  concluido: boolean;
  validadoPor?: string | null;
  validadoEm?: string | null;
}

export interface InsigniaProgresso {
  id: string;
  eixoId: string;
  nome: string;
  requisitos: RequisitoInsignia[];
  concluidosCount: number;
  totalRequisitos: number;
  concluida: boolean;
}

// --- CARREGAMENTO DE EIXOS, BLOCOS E AÇÕES ---
export async function carregarEixosEBlocos(escoteiroId?: string): Promise<EixoProgresso[]> {
  const [eixosRaw, blocosRaw, acoesRaw, progressoRaw] = await Promise.all([
    selQuiet("eixos"),
    selQuiet("blocos"),
    selQuiet("acoes_catalogo"),
    selQuiet("progresso_acoes", escoteiroId ? { escoteiro_id: escoteiroId } : undefined),
  ]);

  const progressoMap = new Map<string, { validado_por?: string; validado_em?: string }>();
  for (const p of progressoRaw) {
    const acaoId = String(p["acao_id"] ?? "");
    if (acaoId) progressoMap.set(acaoId, p);
  }

  const eixosMap = new Map<string, EixoProgresso>();

  for (const e of eixosRaw) {
    const rawId = String(e["id"] ?? "");
    const meta = MAPA_EIXOS[rawId] ?? { nome: String(e["nome"] ?? rawId), ordem: 99 };
    eixosMap.set(rawId, {
      id: rawId,
      nome: meta.nome,
      ordem: meta.ordem,
      blocos: [],
    });
  }

  for (const b of blocosRaw) {
    const blocoId = String(b["id"] ?? "");
    const eixoId = String(b["eixo_id"] ?? "");
    const blocoNome = String(b["nome"] ?? "");
    const blocoOrdem = Number(b["ordem"] ?? 0);

    const acoesDoBloco = acoesRaw
      .filter((a) => String(a["bloco_id"] ?? "") === blocoId)
      .map((a) => {
        const acaoId = String(a["id"] ?? "");
        const prog = progressoMap.get(acaoId);
        return {
          id: acaoId,
          codigo: String(a["codigo"] ?? ""),
          descricao: String(a["descricao"] ?? ""),
          tipo: (String(a["tipo"] ?? "VARIAVEL").toUpperCase() === "FIXA" ? "FIXA" : "VARIAVEL") as "FIXA" | "VARIAVEL",
          ordem: Number(a["ordem"] ?? 0),
          concluida: !!prog,
          validadoPor: prog?.validado_por ?? null,
          validadoEm: prog?.validado_em ?? null,
        };
      })
      .sort((a, b) => a.ordem - b.ordem);

    const fixas = acoesDoBloco.filter((a) => a.tipo === "FIXA");
    const variaveis = acoesDoBloco.filter((a) => a.tipo === "VARIAVEL");

    const blocoObj: BlocoProgresso = {
      id: blocoId,
      eixoId,
      nome: blocoNome,
      ordem: blocoOrdem,
      fixasTotal: fixas.length,
      fixasConcluidas: fixas.filter((a) => a.concluida).length,
      variaveisTotal: variaveis.length,
      variaveisConcluidas: variaveis.filter((a) => a.concluida).length,
      acoes: acoesDoBloco,
    };

    const eixo = eixosMap.get(eixoId);
    if (eixo) {
      eixo.blocos.push(blocoObj);
    }
  }

  return Array.from(eixosMap.values())
    .map((e) => ({
      ...e,
      blocos: e.blocos.sort((a, b) => a.ordem - b.ordem),
    }))
    .sort((a, b) => a.ordem - b.ordem);
}

// --- CARREGAMENTO DE ESPECIALIDADES ---
export async function carregarEspecialidades(escoteiroId?: string): Promise<EspecialidadeProgresso[]> {
  const [catalogoRaw, itensRaw, progressoRaw] = await Promise.all([
    selQuiet("especialidades_catalogo"),
    selQuiet("especialidades_itens"),
    selQuiet("progresso_especialidades_itens", escoteiroId ? { escoteiro_id: escoteiroId } : undefined),
  ]);

  const progressoSet = new Map<string, { validado_por?: string; validado_em?: string }>();
  for (const p of progressoRaw) {
    const itemId = String(p["item_id"] ?? "");
    if (itemId) progressoSet.set(itemId, p);
  }

  const itensPorEspecialidade = new Map<string, RequisitoEspecialidade[]>();
  for (const item of itensRaw) {
    const espIdKey = String(item["especialidade_id"] ?? "").toUpperCase().trim();
    if (!espIdKey) continue;

    const itemId = String(item["id"] ?? "");
    const prog = progressoSet.get(itemId);

    const req: RequisitoEspecialidade = {
      id: itemId,
      numeroItem: Number(item["numero_item"] ?? 0),
      descricao: String(item["descricao"] ?? ""),
      concluido: !!prog,
      validadoPor: prog?.validado_por ?? null,
      validadoEm: prog?.validado_em ?? null,
    };

    if (!itensPorEspecialidade.has(espIdKey)) {
      itensPorEspecialidade.set(espIdKey, []);
    }
    itensPorEspecialidade.get(espIdKey)!.push(req);
  }

  const resultado: EspecialidadeProgresso[] = [];

  for (const esp of catalogoRaw) {
    const rawEspId = String(esp["id"] ?? "");
    const key = rawEspId.toUpperCase().trim();
    const eixoId = String(esp["eixo_id"] ?? "");
    const metaNivel1 = Number(esp["meta_itens_nivel_1"] ?? 0);

    const reqs = (itensPorEspecialidade.get(key) ?? []).sort((a, b) => a.numeroItem - b.numeroItem);
    const concluidos = reqs.filter((r) => r.concluido).length;
    const total = reqs.length;

    let nivelAtual: 0 | 1 | 2 = 0;
    if (total > 0) {
      if (concluidos >= total) {
        nivelAtual = 2;
      } else if (concluidos >= metaNivel1) {
        nivelAtual = 1;
      }
    }

    const metaEixo = MAPA_EIXOS[eixoId] ?? { nome: eixoId };

    resultado.push({
      id: rawEspId,
      eixoId,
      eixoNome: metaEixo.nome,
      nome: String(esp["nome"] ?? rawEspId),
      metaItensNivel1: metaNivel1,
      requisitos: reqs,
      concluidosCount: concluidos,
      totalRequisitos: total,
      nivelAtual,
    });
  }

  return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
}

// --- CARREGAMENTO DE INSÍGNIAS ---
export async function carregarInsignias(escoteiroId?: string): Promise<InsigniaProgresso[]> {
  const [catalogoRaw, itensRaw, progressoRaw] = await Promise.all([
    selQuiet("insignias_catalogo"),
    selQuiet("insignias_itens"),
    selQuiet("progresso_insignias_itens", escoteiroId ? { escoteiro_id: escoteiroId } : undefined),
  ]);

  const progressoSet = new Map<string, { validado_por?: string; validado_em?: string }>();
  for (const p of progressoRaw) {
    const itemId = String(p["item_id"] ?? "");
    if (itemId) progressoSet.set(itemId, p);
  }

  const itensPorInsignia = new Map<string, RequisitoInsignia[]>();
  for (const item of itensRaw) {
    const insgIdKey = String(item["insignia_id"] ?? "").toUpperCase().trim();
    if (!insgIdKey) continue;

    const itemId = String(item["id"] ?? "");
    const prog = progressoSet.get(itemId);

    const req: RequisitoInsignia = {
      id: itemId,
      numeroItem: Number(item["numero_item"] ?? 0),
      descricao: String(item["descricao"] ?? ""),
      concluido: !!prog,
      validadoPor: prog?.validado_por ?? null,
      validadoEm: prog?.validado_em ?? null,
    };

    if (!itensPorInsignia.has(insgIdKey)) {
      itensPorInsignia.set(insgIdKey, []);
    }
    itensPorInsignia.get(insgIdKey)!.push(req);
  }

  const resultado: InsigniaProgresso[] = [];

  for (const insg of catalogoRaw) {
    const rawInsgId = String(insg["id"] ?? "");
    const key = rawInsgId.toUpperCase().trim();
    const eixoId = String(insg["eixo_id"] ?? "");

    const reqs = (itensPorInsignia.get(key) ?? []).sort((a, b) => a.numeroItem - b.numeroItem);
    const concluidos = reqs.filter((r) => r.concluido).length;
    const total = reqs.length;

    resultado.push({
      id: rawInsgId,
      eixoId,
      nome: String(insg["nome"] ?? rawInsgId),
      requisitos: reqs,
      concluidosCount: concluidos,
      totalRequisitos: total,
      concluida: total > 0 && concluidos >= total,
    });
  }

  return resultado;
}

// --- CONSULTA E GERENCIAMENTO DE MEMBROS E PROMESSA ---

export async function fetchMeuMembro(): Promise<Membro | null> {
  const res = await selQuiet<Membro>("escoteiros");
  return res[0] ?? null;
}

export async function fetchJovens(): Promise<Jovem[]> {
  const lista = await selQuiet<Jovem>("escoteiros");
  return lista.sort((a, b) => {
    const nomeA = a.nome || a.nome_completo || a.name || "";
    const nomeB = b.nome || b.nome_completo || b.name || "";
    return nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "base" });
  });
}

export const fetchEscoteiros = fetchJovens;

export async function criarJovem(dados: Record<string, unknown>) {
  return extDb({ data: { op: "insert", tabela: "escoteiros", dados } });
}

export async function atualizarJovem(id: string, dados: Record<string, unknown>) {
  return extDb({ data: { op: "update", tabela: "escoteiros", filtros: { id }, dados } });
}

export async function removerJovem(id: string) {
  return extDb({ data: { op: "delete", tabela: "escoteiros", filtros: { id } } });
}

export async function salvarJovem(dados: Record<string, unknown>) {
  if (dados.id) {
    return atualizarJovem(String(dados.id), dados);
  }
  return criarJovem(dados);
}

export async function fetchPromessas(): Promise<Promessa[]> {
  const todos = await selQuiet<Jovem>("escoteiros");
  return todos
    .filter((j) => Boolean(j.data_promessa) || Boolean(j.promessa_liberada))
    .map((j) => ({
      id: j.id,
      escoteiro_id: j.id,
      jovem_id: j.id,
      data_promessa: j.data_promessa ?? undefined,
      liberada_em: j.data_promessa ?? undefined,
      promessa_liberada: true,
    }));
}

export async function liberarPromessa(escoteiroId: string, arg2?: string, arg3?: string) {
  let dataPromessa = hoje();
  if (arg3) {
    dataPromessa = arg3;
  } else if (arg2) {
    dataPromessa = arg2;
  }

  return extDb({
    data: {
      op: "update",
      tabela: "escoteiros",
      filtros: { id: escoteiroId },
      dados: {
        promessa_liberada: true,
        data_promessa: dataPromessa,
      },
    },
  });
}

export async function removerPromessa(escoteiroId: string) {
  return extDb({
    data: {
      op: "update",
      tabela: "escoteiros",
      filtros: { id: escoteiroId },
      dados: {
        promessa_liberada: false,
        data_promessa: null,
      },
    },
  });
}

// --- CONSULTA E GERENCIAMENTO DE ACOLHIDA ---

export async function fetchAcolhidaCatalogo(): Promise<ItemAcolhida[]> {
  const res = await selQuiet<Record<string, unknown>>("acolhida_catalogo");
  return res.map((item, index) => {
    const idStr = String(item["id"] ?? index + 1);
    const descricao = String(item["descricao"] ?? item["titulo"] ?? "");
    return {
      ...item,
      id: idStr,
      ordem: Number(item["ordem"] ?? (isNaN(Number(idStr)) ? index + 1 : Number(idStr))),
      titulo: String(item["titulo"] ?? descricao),
      descricao: descricao,
    };
  }).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

export async function fetchAcolhidaProgresso(escoteiroId?: string): Promise<AcolhidaProgresso[]> {
  const res = await selQuiet<Record<string, unknown>>(
    "acolhida_progresso",
    escoteiroId ? { escoteiro_id: escoteiroId } : undefined
  );

  return res.map((item) => ({
    ...item,
    escoteiro_id: String(item["escoteiro_id"] ?? escoteiroId ?? ""),
    jovem_id: String(item["escoteiro_id"] ?? escoteiroId ?? ""),
    item_acolhida_id: String(item["item_acolhida_id"] ?? item["item_id"] ?? ""),
    item_id: String(item["item_acolhida_id"] ?? item["item_id"] ?? ""),
    concluida: Boolean(item["concluida"] ?? true),
    data_conclusao: String(item["data_conclusao"] ?? item["data_realizacao"] ?? ""),
    data_realizacao: String(item["data_realizacao"] ?? item["data_conclusao"] ?? ""),
    validado_por: item["validado_por"] ? String(item["validado_por"]) : undefined,
  }));
}

export async function marcarAcolhida(
  param1: string | { jovemId?: string; escoteiroId?: string; escoteiro_id?: string; itemId?: string; item_acolhida_id?: string; data?: string; validadoPor?: string; concluida?: boolean },
  concluida: boolean = true,
  escoteiroId?: string
) {
  if (typeof param1 === "object" && param1 !== null) {
    const jId = param1.jovemId || param1.escoteiroId || param1.escoteiro_id || escoteiroId;
    const itemId = param1.itemId || param1.item_acolhida_id;
    const isConcluida = param1.concluida ?? true;

    return extDb({
      data: {
        op: "upsert",
        tabela: "acolhida_progresso",
        dados: {
          item_acolhida_id: itemId,
          escoteiro_id: jId,
          concluida: isConcluida,
          data_conclusao: param1.data ?? hoje(),
          validado_por: param1.validadoPor,
        },
      },
    });
  }

  return extDb({
    data: {
      op: "upsert",
      tabela: "acolhida_progresso",
      dados: {
        item_acolhida_id: param1,
        escoteiro_id: escoteiroId,
        concluida,
        data_conclusao: hoje(),
      },
    },
  });
}

export async function desmarcarAcolhida(itemAcolhidaId: string, escoteiroId?: string) {
  return extDb({
    data: {
      op: "delete",
      tabela: "acolhida_progresso",
      filtros: escoteiroId
        ? { item_acolhida_id: itemAcolhidaId, escoteiro_id: escoteiroId }
        : { item_acolhida_id: itemAcolhidaId },
    },
  });
}

// --- CONSULTA E GERENCIAMENTO DE EIXOS, BLOCOS E AÇÕES ---

export async function fetchEixos() {
  return selQuiet("eixos");
}

export async function fetchBlocos(eixoId?: string) {
  return selQuiet("blocos", eixoId ? { eixo_id: eixoId } : undefined);
}

export async function fetchAcoesCatalogo(blocoId?: string) {
  return selQuiet("acoes_catalogo", blocoId ? { bloco_id: blocoId } : undefined);
}

export async function fetchStatusBlocos(escoteiroId?: string) {
  return carregarEixosEBlocos(escoteiroId);
}

export async function fetchAcoesProgresso(escoteiroId?: string) {
  return selQuiet("progresso_acoes", escoteiroId ? { escoteiro_id: escoteiroId } : undefined);
}

export async function marcarAcao(
  param1: string | { acaoId?: string; acao_id?: string; escoteiroId?: string; escoteiro_id?: string; jovemId?: string; data?: string; validadoPor?: string; concluida?: boolean },
  concluida: boolean = true,
  escoteiroId?: string
) {
  if (typeof param1 === "object" && param1 !== null) {
    const jId = param1.escoteiroId || param1.escoteiro_id || param1.jovemId || escoteiroId;
    const aId = param1.acaoId || param1.acao_id;
    const isConcluida = param1.concluida ?? true;

    return extDb({
      data: {
        op: "upsert",
        tabela: "progresso_acoes",
        dados: {
          acao_id: aId,
          escoteiro_id: jId,
          concluida: isConcluida,
          validado_em: param1.data ?? hoje(),
          validado_por: param1.validadoPor,
        },
      },
    });
  }

  return extDb({
    data: {
      op: "upsert",
      tabela: "progresso_acoes",
      dados: { acao_id: param1, escoteiro_id: escoteiroId, concluida },
    },
  });
}

export async function desmarcarAcao(acaoId: string, escoteiroId?: string) {
  return extDb({
    data: {
      op: "delete",
      tabela: "progresso_acoes",
      filtros: escoteiroId
        ? { acao_id: acaoId, escoteiro_id: escoteiroId }
        : { acao_id: acaoId },
    },
  });
}

export const toggleAcao = marcarAcao;
export const salvarProgressoAcao = marcarAcao;

export async function marcarAcoesLote(dados: unknown) {
  return extDb({ data: { op: "upsert", tabela: "progresso_acoes", dados } });
}

// --- CONSULTA E GERENCIAMENTO DE ESPECIALIDADES ---

export async function fetchEspecialidadesCatalogo() {
  return selQuiet("especialidades_catalogo");
}

export const fetchEspecialidades = fetchEspecialidadesCatalogo;

export async function fetchEspecialidadesItens(especialidadeId?: string) {
  return selQuiet("especialidades_itens", especialidadeId ? { especialidade_id: especialidadeId } : undefined);
}

export async function fetchEspecialidadesProgresso(escoteiroId?: string) {
  return selQuiet("progresso_especialidades_itens", escoteiroId ? { escoteiro_id: escoteiroId } : undefined);
}

export const fetchProgressoEspecialidadesItens = fetchEspecialidadesProgresso;

export async function marcarEspecialidadeItem(
  param1: string | { itemId?: string; item_id?: string; escoteiroId?: string; escoteiro_id?: string; jovemId?: string; data?: string; validadoPor?: string; concluido?: boolean },
  concluida: boolean = true,
  escoteiroId?: string
) {
  if (typeof param1 === "object" && param1 !== null) {
    const jId = param1.escoteiroId || param1.escoteiro_id || param1.jovemId || escoteiroId;
    const iId = param1.itemId || param1.item_id;
    const isConcluido = param1.concluido ?? true;

    return extDb({
      data: {
        op: "upsert",
        tabela: "progresso_especialidades_itens",
        dados: {
          item_id: iId,
          escoteiro_id: jId,
          concluido: isConcluido,
          validado_em: param1.data ?? hoje(),
          validado_por: param1.validadoPor,
        },
      },
    });
  }

  return extDb({
    data: {
      op: "upsert",
      tabela: "progresso_especialidades_itens",
      dados: { item_id: param1, escoteiro_id: escoteiroId, concluido: concluida },
    },
  });
}

export async function desmarcarEspecialidadeItem(itemId: string, escoteiroId?: string) {
  return extDb({
    data: {
      op: "delete",
      tabela: "progresso_especialidades_itens",
      filtros: escoteiroId
        ? { item_id: itemId, escoteiro_id: escoteiroId }
        : { item_id: itemId },
    },
  });
}

export const marcarItemEspecialidade = marcarEspecialidadeItem;
export const marcarEspecialidade = marcarEspecialidadeItem;
export const toggleItemEspecialidade = marcarEspecialidadeItem;

// --- CONSULTA E GERENCIAMENTO DE INSÍGNIAS ---

export async function fetchInsigniasCatalogo() {
  return selQuiet("insignias_catalogo");
}

export const fetchInsignias = fetchInsigniasCatalogo;

export async function fetchInsigniasItens(insigniaId?: string) {
  return selQuiet("insignias_itens", insigniaId ? { insignia_id: insigniaId } : undefined);
}

export async function fetchInsigniasProgresso(escoteiroId?: string) {
  return selQuiet("progresso_insignias_itens", escoteiroId ? { escoteiro_id: escoteiroId } : undefined);
}

export const fetchProgressoInsigniasItens = fetchInsigniasProgresso;

export async function marcarInsigniaItem(
  param1: string | { itemId?: string; item_id?: string; escoteiroId?: string; escoteiro_id?: string; jovemId?: string; data?: string; validadoPor?: string; concluido?: boolean },
  concluida: boolean = true,
  escoteiroId?: string
) {
  if (typeof param1 === "object" && param1 !== null) {
    const jId = param1.escoteiroId || param1.escoteiro_id || param1.jovemId || escoteiroId;
    const iId = param1.itemId || param1.item_id;
    const isConcluido = param1.concluido ?? true;

    return extDb({
      data: {
        op: "upsert",
        tabela: "progresso_insignias_itens",
        dados: {
          item_id: iId,
          escoteiro_id: jId,
          concluido: isConcluido,
          validado_em: param1.data ?? hoje(),
          validado_por: param1.validadoPor,
        },
      },
    });
  }

  return extDb({
    data: {
      op: "upsert",
      tabela: "progresso_insignias_itens",
      dados: { item_id: param1, escoteiro_id: escoteiroId, concluido: concluida },
    },
  });
}

export async function desmarcarInsigniaItem(itemId: string, escoteiroId?: string) {
  return extDb({
    data: {
      op: "delete",
      tabela: "progresso_insignias_itens",
      filtros: escoteiroId
        ? { item_id: itemId, escoteiro_id: escoteiroId }
        : { item_id: itemId },
    },
  });
}

export const marcarItemInsignia = marcarInsigniaItem;
export const marcarInsignia = marcarInsigniaItem;
export const toggleItemInsignia = marcarInsigniaItem;"