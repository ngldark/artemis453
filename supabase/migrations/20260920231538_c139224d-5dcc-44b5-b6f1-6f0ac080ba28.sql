
CREATE TABLE public.jovens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  patrulha text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jovens TO anon, authenticated;
GRANT ALL ON public.jovens TO service_role;
ALTER TABLE public.jovens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jovens_all" ON public.jovens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.acolhida_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem int NOT NULL,
  titulo text NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acolhida_catalogo TO anon, authenticated;
GRANT ALL ON public.acolhida_catalogo TO service_role;
ALTER TABLE public.acolhida_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acolhida_catalogo_all" ON public.acolhida_catalogo FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.acolhida_progresso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jovem_id uuid NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.acolhida_catalogo(id) ON DELETE CASCADE,
  data_realizacao date NOT NULL DEFAULT current_date,
  validado_por text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jovem_id, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acolhida_progresso TO anon, authenticated;
GRANT ALL ON public.acolhida_progresso TO service_role;
ALTER TABLE public.acolhida_progresso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acolhida_progresso_all" ON public.acolhida_progresso FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.eixos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cor text NOT NULL DEFAULT 'azul',
  ordem int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eixos TO anon, authenticated;
GRANT ALL ON public.eixos TO service_role;
ALTER TABLE public.eixos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eixos_all" ON public.eixos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.blocos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eixo_id uuid NOT NULL REFERENCES public.eixos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  ordem int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocos TO anon, authenticated;
GRANT ALL ON public.blocos TO service_role;
ALTER TABLE public.blocos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocos_all" ON public.blocos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloco_id uuid NOT NULL REFERENCES public.blocos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'fixa',
  ordem int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acoes TO anon, authenticated;
GRANT ALL ON public.acoes TO service_role;
ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acoes_all" ON public.acoes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.acoes_progresso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jovem_id uuid NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
  acao_id uuid NOT NULL REFERENCES public.acoes(id) ON DELETE CASCADE,
  data_realizacao date NOT NULL DEFAULT current_date,
  validado_por text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jovem_id, acao_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acoes_progresso TO anon, authenticated;
GRANT ALL ON public.acoes_progresso TO service_role;
ALTER TABLE public.acoes_progresso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acoes_progresso_all" ON public.acoes_progresso FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.promessas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jovem_id uuid NOT NULL UNIQUE REFERENCES public.jovens(id) ON DELETE CASCADE,
  liberada_em date NOT NULL DEFAULT current_date,
  liberada_por text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promessas TO anon, authenticated;
GRANT ALL ON public.promessas TO service_role;
ALTER TABLE public.promessas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promessas_all" ON public.promessas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_jovens_u BEFORE UPDATE ON public.jovens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_acat_u BEFORE UPDATE ON public.acolhida_catalogo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aprog_u BEFORE UPDATE ON public.acolhida_progresso FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_eixos_u BEFORE UPDATE ON public.eixos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_blocos_u BEFORE UPDATE ON public.blocos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_acoes_u BEFORE UPDATE ON public.acoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_acoesp_u BEFORE UPDATE ON public.acoes_progresso FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prom_u BEFORE UPDATE ON public.promessas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.acolhida_catalogo (ordem, titulo, descricao) VALUES
 (1, 'Conhecer a Tropa Escoteira', 'Participar de atividades e conhecer a estrutura da Tropa e suas patrulhas.'),
 (2, 'Participar de uma reunião de Patrulha', 'Integrar-se à sua patrulha e conhecer seus membros e funções.'),
 (3, 'Conhecer a Lei e a Promessa Escoteira', 'Compreender o significado da Lei e da Promessa no dia a dia.'),
 (4, 'Conhecer a história do Escotismo', 'Saber quem foi Baden-Powell e como nasceu o Movimento Escoteiro.'),
 (5, 'Participar de uma atividade ao ar livre', 'Vivenciar uma atividade de campo com a Tropa.'),
 (6, 'Conhecer o uniforme e os símbolos', 'Identificar o uniforme, distintivos e o significado da flor-de-lis.'),
 (7, 'Definir seu compromisso pessoal', 'Conversar com o chefe sobre sua decisão de fazer a Promessa.');

INSERT INTO public.jovens (nome, patrulha) VALUES
 ('Ana Beatriz Souza', 'Patrulha Falcão'),
 ('Bruno Carvalho', 'Patrulha Lobo'),
 ('Camila Ferreira', 'Patrulha Falcão'),
 ('Diego Martins', 'Patrulha Tucano'),
 ('Elisa Nunes', 'Patrulha Lobo'),
 ('Felipe Andrade', 'Patrulha Tucano');

INSERT INTO public.eixos (nome, cor, ordem) VALUES
 ('Habilidades para a Vida', 'azul', 1),
 ('Meio Ambiente', 'verde', 2),
 ('Paz e Desenvolvimento', 'dourado', 3),
 ('Saúde e Bem-estar', 'azul', 4);

INSERT INTO public.blocos (eixo_id, nome, descricao, ordem)
SELECT e.id, b.nome, b.descricao, b.ordem FROM public.eixos e
JOIN (VALUES
 ('Habilidades para a Vida', 'Vida em Equipe', 'Trabalho em patrulha, liderança e cooperação.', 1),
 ('Habilidades para a Vida', 'Técnicas Escoteiras', 'Nós, amarras, pioneirias e orientação.', 2),
 ('Habilidades para a Vida', 'Comunicação', 'Expressão oral, escrita e uso de mídias.', 3),
 ('Meio Ambiente', 'Natureza e Biodiversidade', 'Fauna, flora e ecossistemas locais.', 1),
 ('Meio Ambiente', 'Mínimo Impacto', 'Práticas de acampamento sustentável.', 2),
 ('Meio Ambiente', 'Projetos Ambientais', 'Ações concretas de cuidado com o ambiente.', 3),
 ('Paz e Desenvolvimento', 'Cidadania', 'Direitos, deveres e participação comunitária.', 1),
 ('Paz e Desenvolvimento', 'Cultura de Paz', 'Resolução de conflitos e diálogo.', 2),
 ('Paz e Desenvolvimento', 'Serviço Comunitário', 'Projetos de impacto social.', 3),
 ('Saúde e Bem-estar', 'Corpo em Movimento', 'Atividade física e esporte.', 1),
 ('Saúde e Bem-estar', 'Alimentação Saudável', 'Nutrição e preparo de alimentos.', 2),
 ('Saúde e Bem-estar', 'Saúde Mental', 'Autoconhecimento e equilíbrio emocional.', 3)
) AS b(eixo, nome, descricao, ordem) ON b.eixo = e.nome;

INSERT INTO public.acoes (bloco_id, titulo, descricao, tipo, ordem)
SELECT bl.id, a.titulo, a.descricao, a.tipo, a.ordem FROM public.blocos bl
CROSS JOIN LATERAL (VALUES
 ('Ação obrigatória 1 de ' || bl.nome, 'Participar e registrar a vivência principal do bloco.', 'fixa', 1),
 ('Ação obrigatória 2 de ' || bl.nome, 'Demonstrar o aprendizado para a patrulha.', 'fixa', 2),
 ('Ação variável de ' || bl.nome, 'Escolher uma atividade complementar do bloco.', 'variavel', 3),
 ('Especialidade que soma em ' || bl.nome, 'Conquistar uma especialidade relacionada ao bloco.', 'variavel', 4),
 ('Substituição por Insígnia em ' || bl.nome, 'Insígnia equivalente substitui as ações fixas do bloco.', 'substituicao', 5),
 ('Substituição por Especialidade Nível 2 em ' || bl.nome, 'Especialidade nível 2 substitui as ações fixas do bloco.', 'substituicao', 6)
) AS a(titulo, descricao, tipo, ordem);

INSERT INTO public.acolhida_progresso (jovem_id, item_id, data_realizacao, validado_por)
SELECT j.id, c.id, current_date - (c.ordem * 5), 'Chefe Marcos'
FROM public.jovens j JOIN public.acolhida_catalogo c ON c.ordem <= 4
WHERE j.nome IN ('Ana Beatriz Souza', 'Bruno Carvalho');
