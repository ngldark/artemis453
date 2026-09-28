import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Operações permitidas no banco oficial da tropa (projeto externo).
export const TABELAS = [
  "escoteiros",
  "eixos",
  "blocos",
  "acoes_catalogo",
  "acolhida_catalogo",
  "acolhida_progresso",
  "progresso_acoes",
  "vw_status_blocos",
  "vw_progresso_blocos",
  "especialidades",
  "especialidades_itens",
  "progresso_especialidades_itens",
  "insignias",
  "insignias_itens",
  "progresso_insignias_itens",
] as const;

const schema = z.object({
  op: z.enum(["select", "insert", "update", "delete"]),
  tabela: z.enum(TABELAS),
  filtros: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  valores: z.record(z.string(), z.unknown()).optional(),
});

export const extDb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["EXT_SUPABASE_URL"];
    const key = process.env["EXT_SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Banco oficial não configurado");

    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    // Identifica o usuário atual pelo e-mail do token para validação de segurança
    const email = String((context.claims as Record<string, unknown>)["email"] ?? "")
      .trim()
      .toLowerCase();

    let perfilUsuario = "ESCOTEIRO";
    let meuId: string | null = null;

    if (email) {
      const { data: membroData } = await db
        .from("escoteiros")
        .select("id, perfil")
        .ilike("email", email)
        .limit(1);
      if (membroData?.[0]) {
        perfilUsuario = String(membroData[0].perfil ?? "ESCOTEIRO").toUpperCase();
        meuId = membroData[0].id;
      }
    }

    const somenteLeitura =
      data.tabela.startsWith("vw_") ||
      [
        "eixos",
        "blocos",
        "acoes_catalogo",
        "acolhida_catalogo",
        "especialidades",
        "especialidades_itens",
        "insignias",
        "insignias_itens",
      ].includes(data.tabela);

    if (data.op !== "select" && somenteLeitura) throw new Error("Tabela somente leitura");

    // --- BLINDAGEM COMPLETA DE SEGURANÇA E PRIVACIDADE ---
    const tabelasPessoais = [
      "acolhida_progresso",
      "progresso_acoes",
      "progresso_especialidades_itens",
      "progresso_insignias_itens",
    ];

    if (perfilUsuario !== "CHEFE") {
      if (!meuId) throw new Error("Usuário não encontrado na tropa.");

      if (tabelasPessoais.includes(data.tabela)) {
        if (data.op === "select") {
          data.filtros = { escoteiro_id: meuId };
        } else {
          // Força o escoteiro_id para o próprio usuário e REMOVE validado_por para evitar auto-validação / ganho de wins
          if (data.valores) {
            data.valores["escoteiro_id"] = meuId;
            delete data.valores["validado_por"]; 
          }
          data.filtros = { escoteiro_id: meuId };
        }
      } else if (data.tabela === "escoteiros") {
        if (data.op === "select") {
          data.filtros = { id: meuId };
        } else {
          throw new Error("Acesso negado: escoteiros não podem alterar cadastros.");
        }
      } else {
        if (data.op !== "select") {
          throw new Error("Acesso negado para esta operação.");
        }
      }
    } else {
      // Validação de filtros seguros para perfis de chefe
      if (tabelasPessoais.includes(data.tabela) && data.filtros) {
        const allowedFilterKeys = ["escoteiro_id", "item_id", "acao_id", "id"];
        for (const key of Object.keys(data.filtros)) {
          if (!allowedFilterKeys.includes(key)) {
            throw new Error(`Filtro não permitido: ${key}`);
          }
        }
      }
    }
    // ----------------------------------------------------

    const filtros = Object.entries(data.filtros ?? {});
    if ((data.op === "update" || data.op === "delete") && filtros.length === 0) throw new Error("Filtro obrigatório");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any;
    if (data.op === "select") {
      q = db.from(data.tabela).select("*").limit(5000);
    } else if (data.op === "insert") {
      q = db.from(data.tabela).insert(data.valores ?? {});
    } else if (data.op === "update") {
      q = db.from(data.tabela).update(data.valores ?? {});
    } else {
      q = db.from(data.tabela).delete();
    }

    for (const [k, v] of filtros) {
      q = q.eq(k, v);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return JSON.stringify(rows ?? []);
  });

// Identifica o membro da tropa a partir do e-mail autenticado (lista branca).
export const meuMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String((context.claims as Record<string, unknown>)["email"] ?? "")
      .trim()
      .toLowerCase();
    if (!email) return JSON.stringify(null);

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["EXT_SUPABASE_URL"];
    const key = process.env["EXT_SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Banco oficial não configurado");
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await db
      .from("escoteiros")
      .select("id, nome_completo, patrulha, perfil, email")
      .ilike("email", email)
      .limit(1);
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return JSON.stringify(null);
    return JSON.stringify({
      id: row["id"],
      nome: row["nome_completo"],
      patrulha: row["patrulha"] ?? null,
      perfil: String(row["perfil"] ?? "ESCOTEIRO").toUpperCase(),
      email: row["email"] ?? email,
    });
  });