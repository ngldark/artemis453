ALTER TABLE public.blocos ADD COLUMN IF NOT EXISTS meta_variaveis integer NOT NULL DEFAULT 0;

CREATE TABLE public.acoes_catalogo (
  id text PRIMARY KEY,
  bloco_id uuid NOT NULL REFERENCES public.blocos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('FIXA','VARIAVEL','OU')),
  numero integer NOT NULL DEFAULT 1,
  descricao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acoes_catalogo TO authenticated;
GRANT ALL ON public.acoes_catalogo TO service_role;
ALTER TABLE public.acoes_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY acoes_catalogo_select ON public.acoes_catalogo FOR SELECT TO authenticated USING (true);

CREATE TABLE public.progresso_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escoteiro_id uuid NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
  acao_id text NOT NULL REFERENCES public.acoes_catalogo(id) ON DELETE CASCADE,
  data_conclusao date NOT NULL DEFAULT CURRENT_DATE,
  validado_por text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (escoteiro_id, acao_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progresso_acoes TO authenticated;
GRANT ALL ON public.progresso_acoes TO service_role;
ALTER TABLE public.progresso_acoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY progresso_acoes_rw ON public.progresso_acoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_acoescat_u BEFORE UPDATE ON public.acoes_catalogo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_progacoes_u BEFORE UPDATE ON public.progresso_acoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.acoes_catalogo (id, bloco_id, tipo, numero, descricao)
SELECT a.id::text, a.bloco_id,
  CASE a.tipo WHEN 'fixa' THEN 'FIXA' WHEN 'variavel' THEN 'VARIAVEL' ELSE 'OU' END,
  a.ordem,
  COALESCE(NULLIF(a.descricao, ''), a.titulo)
FROM public.acoes a;

UPDATE public.blocos b SET meta_variaveis = COALESCE((
  SELECT count(*) FROM public.acoes_catalogo c WHERE c.bloco_id = b.id AND c.tipo = 'VARIAVEL'
), 0);

INSERT INTO public.progresso_acoes (escoteiro_id, acao_id, data_conclusao, validado_por)
SELECT p.jovem_id, p.acao_id::text, p.data_realizacao, p.validado_por
FROM public.acoes_progresso p
WHERE EXISTS (SELECT 1 FROM public.acoes_catalogo c WHERE c.id = p.acao_id::text)
ON CONFLICT DO NOTHING;

CREATE VIEW public.vw_status_blocos WITH (security_invoker = on) AS
SELECT
  j.id AS escoteiro_id,
  b.id AS bloco_id,
  b.nome AS bloco_nome,
  COALESCE(f.total, 0) > 0 AND COALESCE(f.feitas, 0) = COALESCE(f.total, 0) AS todas_fixas_concluidas,
  COALESCE(v.feitas, 0) AS variaveis_concluidas,
  b.meta_variaveis,
  COALESCE(o.feitas, 0) > 0 AS acao_ou_concluida,
  COALESCE(o.feitas, 0) > 0 AS atalho_conquistado,
  (COALESCE(o.feitas, 0) > 0)
    OR (COALESCE(f.total, 0) > 0 AND COALESCE(f.feitas, 0) = COALESCE(f.total, 0)
        AND COALESCE(v.feitas, 0) >= b.meta_variaveis) AS bloco_concluido
FROM public.jovens j
CROSS JOIN public.blocos b
LEFT JOIN LATERAL (
  SELECT count(*) AS total,
         count(*) FILTER (WHERE pa.id IS NOT NULL) AS feitas
  FROM public.acoes_catalogo c
  LEFT JOIN public.progresso_acoes pa ON pa.acao_id = c.id AND pa.escoteiro_id = j.id
  WHERE c.bloco_id = b.id AND c.tipo = 'FIXA'
) f ON true
LEFT JOIN LATERAL (
  SELECT count(*) FILTER (WHERE pa.id IS NOT NULL) AS feitas
  FROM public.acoes_catalogo c
  LEFT JOIN public.progresso_acoes pa ON pa.acao_id = c.id AND pa.escoteiro_id = j.id
  WHERE c.bloco_id = b.id AND c.tipo = 'VARIAVEL'
) v ON true
LEFT JOIN LATERAL (
  SELECT count(*) FILTER (WHERE pa.id IS NOT NULL) AS feitas
  FROM public.acoes_catalogo c
  LEFT JOIN public.progresso_acoes pa ON pa.acao_id = c.id AND pa.escoteiro_id = j.id
  WHERE c.bloco_id = b.id AND c.tipo = 'OU'
) o ON true;

GRANT SELECT ON public.vw_status_blocos TO authenticated;
GRANT ALL ON public.vw_status_blocos TO service_role;