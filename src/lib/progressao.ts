import { extDb, TABELAS } from "./ext.functions";

export type TabelaNome = (typeof TABELAS)[number];

// Mapeamento visual e amigável dos Eixos
export const MAPA_EIXOS: Record<string, { nome: string; ordem: number }> = {
  EIXO_HABILIDADES: { nome: "Habilidades para a Vida", ordem: 1 },
  EIXO_MEIO_AMBIENTE: { nome: "Meio Ambiente", ordem: 2 },
  EIXO_PAZ: { nome: "Paz e Desenvolvimento", ordem: 3 },
  EIXO_SAUDE: { nome: "Saúde e Bem-estar", ordem: 4 },
};

async function selQuiet<T = Record<string, unknown>>(
  tabela: TabelaNome,
  filtros?: Record<string, string | number>
): Promise<T[]> {
  try {
    const raw = await extDb({ data: { op: "select", tabela, filtros } });
    return JSON.parse(raw) as T[];
  } catch (err) {
    console.error(`Erro ao buscar tabela ${tabela}:`, err);
    return [];
  }
}

// --- TIPOS ---
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

  // Agrupa itens com comparação case-insensitive
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