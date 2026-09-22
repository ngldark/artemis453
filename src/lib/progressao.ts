import { supabase } from "@/integrations/supabase/client";

export type Perfil = "escoteiro" | "chefe";

export type Jovem = { id: string; nome: string; patrulha: string | null };
export type ItemAcolhida = { id: string; ordem: number; titulo: string; descricao: string | null };
export type AcolhidaProgresso = {
  id: string;
  jovem_id: string;
  item_id: string;
  data_realizacao: string;
  validado_por: string | null;
};
export type Eixo = { id: string; nome: string; cor: string; ordem: number };
export type Bloco = { id: string; eixo_id: string; nome: string; descricao: string | null; ordem: number };
export type Acao = {
  id: string;
  bloco_id: string;
  titulo: string;
  descricao: string | null;
  tipo: "fixa" | "variavel" | "substituicao";
  ordem: number;
};
export type AcaoProgresso = {
  id: string;
  jovem_id: string;
  acao_id: string;
  data_realizacao: string;
  validado_por: string | null;
};
export type Promessa = { id: string; jovem_id: string; liberada_em: string; liberada_por: string | null };

const rows = <T,>(data: unknown): T[] => (data ?? []) as T[];

export async function fetchJovens() {
  const { data, error } = await supabase.from("jovens").select("*").order("nome");
  if (error) throw error;
  return rows<Jovem>(data);
}

export async function fetchAcolhidaCatalogo() {
  const { data, error } = await supabase.from("acolhida_catalogo").select("*").order("ordem");
  if (error) throw error;
  return rows<ItemAcolhida>(data);
}

export async function fetchAcolhidaProgresso(jovemId?: string) {
  let q = supabase.from("acolhida_progresso").select("*");
  if (jovemId) q = q.eq("jovem_id", jovemId);
  const { data, error } = await q;
  if (error) throw error;
  return rows<AcolhidaProgresso>(data);
}

export async function fetchEixos() {
  const { data, error } = await supabase.from("eixos").select("*").order("ordem");
  if (error) throw error;
  return rows<Eixo>(data);
}

export async function fetchBlocos() {
  const { data, error } = await supabase.from("blocos").select("*").order("ordem");
  if (error) throw error;
  return rows<Bloco>(data);
}

export async function fetchAcoes() {
  const { data, error } = await supabase.from("acoes").select("*").order("ordem");
  if (error) throw error;
  return rows<Acao>(data);
}

export async function fetchAcoesProgresso(jovemId?: string) {
  let q = supabase.from("acoes_progresso").select("*");
  if (jovemId) q = q.eq("jovem_id", jovemId);
  const { data, error } = await q;
  if (error) throw error;
  return rows<AcaoProgresso>(data);
}

export async function fetchPromessas() {
  const { data, error } = await supabase.from("promessas").select("*");
  if (error) throw error;
  return rows<Promessa>(data);
}

export async function marcarAcolhida(input: {
  jovemId: string;
  itemId: string;
  data: string;
  validadoPor: string;
}) {
  const { error } = await supabase
    .from("acolhida_progresso")
    .upsert(
      {
        jovem_id: input.jovemId,
        item_id: input.itemId,
        data_realizacao: input.data,
        validado_por: input.validadoPor || null,
      },
      { onConflict: "jovem_id,item_id" },
    );
  if (error) throw error;
}

export async function desmarcarAcolhida(jovemId: string, itemId: string) {
  const { error } = await supabase
    .from("acolhida_progresso")
    .delete()
    .eq("jovem_id", jovemId)
    .eq("item_id", itemId);
  if (error) throw error;
}

export async function marcarAcao(input: {
  jovemId: string;
  acaoId: string;
  data: string;
  validadoPor: string;
}) {
  const { error } = await supabase.from("acoes_progresso").upsert(
    {
      jovem_id: input.jovemId,
      acao_id: input.acaoId,
      data_realizacao: input.data,
      validado_por: input.validadoPor || null,
    },
    { onConflict: "jovem_id,acao_id" },
  );
  if (error) throw error;
}

export async function desmarcarAcao(jovemId: string, acaoId: string) {
  const { error } = await supabase
    .from("acoes_progresso")
    .delete()
    .eq("jovem_id", jovemId)
    .eq("acao_id", acaoId);
  if (error) throw error;
}

export async function liberarPromessa(jovemId: string, liberadaPor: string, data: string) {
  const { error } = await supabase
    .from("promessas")
    .upsert({ jovem_id: jovemId, liberada_em: data, liberada_por: liberadaPor || null }, { onConflict: "jovem_id" });
  if (error) throw error;
}

export async function removerPromessa(jovemId: string) {
  const { error } = await supabase.from("promessas").delete().eq("jovem_id", jovemId);
  if (error) throw error;
}

export async function criarJovem(nome: string, patrulha: string) {
  const { error } = await supabase.from("jovens").insert({ nome, patrulha: patrulha || null });
  if (error) throw error;
}

export async function atualizarJovem(id: string, nome: string, patrulha: string) {
  const { error } = await supabase.from("jovens").update({ nome, patrulha: patrulha || null }).eq("id", id);
  if (error) throw error;
}

export async function removerJovem(id: string) {
  const { error } = await supabase.from("jovens").delete().eq("id", id);
  if (error) throw error;
}

export const hoje = () => new Date().toISOString().slice(0, 10);

export function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
