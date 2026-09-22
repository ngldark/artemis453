
-- Remove permissive anon-accessible policies and restrict all data to authenticated users
DROP POLICY IF EXISTS "jovens_all" ON public.jovens;
DROP POLICY IF EXISTS "acolhida_catalogo_all" ON public.acolhida_catalogo;
DROP POLICY IF EXISTS "acolhida_progresso_all" ON public.acolhida_progresso;
DROP POLICY IF EXISTS "eixos_all" ON public.eixos;
DROP POLICY IF EXISTS "blocos_all" ON public.blocos;
DROP POLICY IF EXISTS "acoes_all" ON public.acoes;
DROP POLICY IF EXISTS "acoes_progresso_all" ON public.acoes_progresso;
DROP POLICY IF EXISTS "promessas_all" ON public.promessas;

REVOKE ALL ON public.jovens FROM anon;
REVOKE ALL ON public.acolhida_catalogo FROM anon;
REVOKE ALL ON public.acolhida_progresso FROM anon;
REVOKE ALL ON public.eixos FROM anon;
REVOKE ALL ON public.blocos FROM anon;
REVOKE ALL ON public.acoes FROM anon;
REVOKE ALL ON public.acoes_progresso FROM anon;
REVOKE ALL ON public.promessas FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jovens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acolhida_catalogo TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acolhida_progresso TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eixos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acoes_progresso TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promessas TO authenticated;

GRANT ALL ON public.jovens TO service_role;
GRANT ALL ON public.acolhida_catalogo TO service_role;
GRANT ALL ON public.acolhida_progresso TO service_role;
GRANT ALL ON public.eixos TO service_role;
GRANT ALL ON public.blocos TO service_role;
GRANT ALL ON public.acoes TO service_role;
GRANT ALL ON public.acoes_progresso TO service_role;
GRANT ALL ON public.promessas TO service_role;

-- Reference/catalog data: readable by signed-in users, no writes from the app
CREATE POLICY "acolhida_catalogo_select" ON public.acolhida_catalogo
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eixos_select" ON public.eixos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "blocos_select" ON public.blocos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "acoes_select" ON public.acoes
  FOR SELECT TO authenticated USING (true);

-- Operational data: signed-in users (the unit's leaders) can manage it
CREATE POLICY "jovens_rw" ON public.jovens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acolhida_progresso_rw" ON public.acolhida_progresso
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acoes_progresso_rw" ON public.acoes_progresso
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "promessas_rw" ON public.promessas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
