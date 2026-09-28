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
  "especialidades_catalogo",
  "especialidades_itens",
  "progresso_especialidades_itens",
  "insignias_catalogo",
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
        "especialidades_catalogo",
        "especialidades_itens",
        "insignias_catalogo",
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

    let targetEscoteiroId: string | number | undefined = undefined;

    if (perfilUsuario !== "CHEFE") {
      if (!meuId) throw new Error("Usuário não encontrado na tropa.");

      if (tabelasPessoais.includes(data.tabela)) {
        targetEscoteiroId = meuId;
        if (data.op !== "select" && data.valores) {
          delete data.valores["validado_por"]; // Impede auto-validação
          data.valores["escoteiro_id"] = meuId;
        }
      } else if (data.tabela === "escoteiros") {
        if (data.op === "select") {
          targetEscoteiroId = meuId;
        } else {
          throw new Error("Acesso negado: escoteiros não podem alterar cadastros.");
        }
      } else {
        if (data.op !== "select") {
          throw new Error("Acesso negado para esta operação.");
        }
      }
    } else {
      if (data.filtros?.["escoteiro_id"]) {
        targetEscoteiroId = data.filtros["escoteiro_id"];
      }
    }
    // ----------------------------------------------------

    // --- EXECUÇÃO SEGURA DA QUERY ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any;

    if (data.op === "select") {
      q = db.from(data.tabela).select("*").limit(5000);
      if (data.tabela === "escoteiros" && perfilUsuario !== "CHEFE") {
        q = q.eq("id", meuId);
      } else if (tabelasPessoais.includes(data.tabela)) {
        if (perfilUsuario !== "CHEFE") {
          q = q.eq("escoteiro_id", meuId);
        } else if (targetEscoteiroId) {
          q = q.eq("escoteiro_id", targetEscoteiroId);
        }
      } else {
        if (data.filtros?.["id"]) q = q.eq("id", data.filtros["id"]);
        if (data.filtros?.["item_id"]) q = q.eq("item_id", data.filtros["item_id"]);
        if (data.filtros?.["acao_id"]) q = q.eq("acao_id", data.filtros["acao_id"]);
        if (data.filtros?.["bloco_id"]) q = q.eq("bloco_id", data.filtros["bloco_id"]);
        if (data.filtros?.["especialidade_id"]) q = q.eq("especialidade_id", data.filtros["especialidade_id"]);
        if (data.filtros?.["insignia_id"]) q = q.eq("insignia_id", data.filtros["insignia_id"]);
      }
    } else if (data.op === "insert") {
      const payload = data.valores ?? {};
      if (tabelasPessoais.includes(data.tabela) && perfilUsuario !== "CHEFE") {
        payload["escoteiro_id"] = meuId;
        delete payload["validado_por"];
      }
      q = db.from(data.tabela).insert(payload);
    } else if (data.op === "update") {
      const payload = data.valores ?? {};
      if (tabelasPessoais.includes(data.tabela) && perfilUsuario !== "CHEFE") {
        payload["escoteiro_id"] = meuId;
        delete payload["validado_por"];
      }
      q = db.from(data.tabela).update(payload);
      if (targetEscoteiroId && tabelasPessoais.includes(data.tabela)) {
        q = q.eq("escoteiro_id", targetEscoteiroId);
      }
      if (data.filtros?.["id"]) q = q.eq("id", data.filtros["id"]);
      if (data.filtros?.["item_id"]) q = q.eq("item_id", data.filtros["item_id"]);
      if (data.filtros?.["acao_id"]) q = q.eq("acao_id", data.filtros["acao_id"]);
    } else if (data.op === "delete") {
      q = db.from(data.tabela).delete();
      if (targetEscoteiroId && tabelasPessoais.includes(data.tabela)) {
        q = q.eq("escoteiro_id", targetEscoteiroId);
      }
      if (data.filtros?.["id"]) q = q.eq("id", data.filtros["id"]);
      if (data.filtros?.["item_id"]) q = q.eq("item_id", data.filtros["item_id"]);
      if (data.filtros?.["acao_id"]) q = q.eq("acao_id", data.filtros["acao_id"]);
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