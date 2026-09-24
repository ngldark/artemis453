import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Operações permitidas no banco oficial da tropa (projeto externo).
const TABELAS = [
  "escoteiros",
  "eixos",
  "blocos",
  "acoes_catalogo",
  "acolhida_catalogo",
  "acolhida_progresso",
  "progresso_acoes",
  "vw_status_blocos",
  "vw_progresso_blocos",
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
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["EXT_SUPABASE_URL"];
    const key = process.env["EXT_SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Banco oficial não configurado");
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const somenteLeitura = data.tabela.startsWith("vw_") || ["eixos", "blocos", "acoes_catalogo", "acolhida_catalogo"].includes(data.tabela);
    if (data.op !== "select" && somenteLeitura) throw new Error("Tabela somente leitura");
    const filtros = Object.entries(data.filtros ?? {});
    if ((data.op === "update" || data.op === "delete") && filtros.length === 0) throw new Error("Filtro obrigatório");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any;
    if (data.op === "select") q = db.from(data.tabela).select("*").limit(5000);
    else if (data.op === "insert") q = db.from(data.tabela).insert(data.valores ?? {});
    else if (data.op === "update") q = db.from(data.tabela).update(data.valores ?? {});
    else q = db.from(data.tabela).delete();
    for (const [k, v] of filtros) q = q.eq(k, v);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return JSON.parse(JSON.stringify(rows ?? [])) as Record<string, unknown>[];
  });
