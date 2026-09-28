import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Award, Compass, ShieldCheck, BookOpen, ChevronRight, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import {
  fetchAcolhidaCatalogo,
  fetchAcolhidaProgresso,
  fetchPromessas,
  fetchEscoteiros,
  fetchEixos,
  fetchBlocos,
  fetchAcoesCatalogo,
  fetchAcoesProgresso,
  fetchEspecialidadesProgresso,
  fetchInsigniasProgresso,
} from "@/lib/progressao";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Progressão Escoteira" },
      {
        name: "description",
        content: "Painel de controle e acompanhamento da progressão do jovem escoteiro.",
      },
      { property: "og:title", content: "Dashboard — Progressão Escoteira" },
      {
        property: "og:description",
        content: "Painel de controle e acompanhamento da progressão do jovem escoteiro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Dashboard() {
  const navigate = useNavigate();
  const { jovemId, setJovemId } = useAppState();

  // Busca dados gerais para controle e estatísticas
  const { data: escoteiros = [] } = useQuery({ queryKey: ["escoteiros"], queryFn: fetchEscoteiros });
  const { data: itensAcolhida = [] } = useQuery({ queryKey: ["acolhida_catalogo"], queryFn: fetchAcolhidaCatalogo });
  const { data: progAcolhida = [] } = useQuery({
    queryKey: ["acolhida_progresso", jovemId],
    queryFn: () => fetchAcolhidaProgresso(jovemId!),
    enabled: !!jovemId,
  });
  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });
  const { data: eixos = [] } = useQuery({ queryKey: ["eixos"], queryFn: fetchEixos });
  const { data: blocos = [] } = useQuery({ queryKey: ["blocos"], queryFn: fetchBlocos });
  const { data: acoesCatalogo = [] } = useQuery({ queryKey: ["acoes_catalogo"], queryFn: () => fetchAcoesCatalogo() });
  const { data: progAcoes = [] } = useQuery({
    queryKey: ["acoes_progresso", jovemId],
    queryFn: () => fetchAcoesProgresso(jovemId!),
    enabled: !!jovemId,
  });
  const { data: espProgresso = [] } = useQuery({
    queryKey: ["especialidades_progresso", jovemId],
    queryFn: () => fetchEspecialidadesProgresso(jovemId!),
    enabled: !!jovemId,
  });
  const { data: insProgresso = [] } = useQuery({
    queryKey: ["insignias_progresso", jovemId],
    queryFn: () => fetchInsigniasProgresso(jovemId!),
    enabled: !!jovemId,
  });

  // Seleciona o primeiro escoteiro por padrão se nenhum estiver ativo
  useEffect(() => {
    if (escoteiros.length > 0 && !jovemId) {
      setJovemId(escoteiros[0].id);
    }
  }, [escoteiros, jovemId, setJovemId]);

  // Cálculos da Acolhida
  const feitosAcolhida = progAcolhida.length;
  const totalAcolhida = itensAcolhida.length || 7;
  const pctAcolhida = Math.round((feitosAcolhida / totalAcolhida) * 100);

  // Verificação de Promessa
  const promessaLiberada = promessas.find((p) => (p.jovem_id || p.escoteiro_id) === jovemId);

  // Estatísticas de Eixos/Ações (se com promessa)
  const totalAcoes = acoesCatalogo.length;
  const concluidasAcoes = progAcoes.length;
  const pctGeralAcoes = totalAcoes > 0 ? Math.round((concluidasAcoes / totalAcoes) * 100) : 0;

  // Contadores de Especialidades e Insígnias
  const espNivel1 = espProgresso.filter((e) => e.nivel === 1 && e.concluida).length;
  const espNivel2 = espProgresso.filter((e) => e.nivel === 2 && e.concluida).length;
  const totalInsignias = insProgresso.filter((i) => i.concluida).length;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO DASHBOARD */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Painel de Progressão</h1>
        <p className="text-sm text-muted-foreground">
          {promessaLiberada
            ? "Acompanhe o desenvolvimento completo nos Eixos e Conquistas."
            : "O jovem encontra-se em Período de Acolhida. Conclua os passos para liberar os Eixos."}
        </p>
      </div>

      {!promessaLiberada ? (
        /* ESTADO 1: SEM PROMESSA (BLOQUEADO / ACOLHIDA EM ANDAMENTO) */
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-leaf/40 bg-leaf/5 p-6 shadow-sm">
            <div className="absolute right-4 top-4 text-leaf/20">
              <Compass className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-leaf text-leaf-foreground">Período de Acolhida</Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  {feitosAcolhida} de {totalAcolhida} passos concluídos
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold">Rumo à Promessa Escoteira</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Para habilitar os Eixos de Desenvolvimento (Desenvolvimento Físico, Intelectual, Caráter, Afetivo, Social e Espiritual), é necessário concluir os 7 passos da Acolhida e registrar a Promessa.
                </p>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progresso da Acolhida</span>
                  <span>{pctAcolhida}%</span>
                </div>
                <Progress value={pctAcolhida} className="h-2.5 bg-leaf/20" />
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => navigate({ to: "/acolhida" })}
                  className="bg-leaf text-leaf-foreground hover:bg-leaf/90 gap-2"
                >
                  Acessar Período de Acolhida <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* CARD DE BLOQUEIO DAS DEMAIS SEÇÕES */}
          <Card className="grid gap-4 p-5 border-dashed border-muted-foreground/30 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-muted p-2 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">Seções Bloqueadas Temporalmente</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Especialidades, Insígnias e os Eixos de Progressão exigem que o escoteiro tenha realizado a sua Promessa Escoteira. Conclua os itens pendentes na aba de Acolhida para liberar todo o conteúdo.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* ESTADO 2: COM PROMESSA (DASHBOARD COMPLETO) */
        <div className="space-y-6">
          {/* BANNER DE STATUS DA PROMESSA */}
          <Card className="border-gold/50 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gold/20 p-3 text-gold-foreground">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Promessa Registrada</h2>
                  <p className="text-xs text-muted-foreground">
                    Eixos de desenvolvimento e insígnias totalmente liberados.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-gold/40 hover:bg-gold/10 text-xs"
                onClick={() => navigate({ to: "/acolhida" })}
              >
                Ver Detalhes da Acolhida
              </Button>
            </div>
          </Card>

          {/* GRID DE ESTATÍSTICAS RÁPIDAS */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Progresso Geral</span>
                <Compass className="h-4 w-4 text-leaf" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pctGeralAcoes}%</div>
                <p className="text-xs text-muted-foreground">
                  {concluidasAcoes} de {totalAcoes} ações concluídas
                </p>
              </div>
              <Progress value={pctGeralAcoes} className="h-1.5" />
            </Card>

            <Card className="p-4 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Especialidades</span>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{espNivel1 + espNivel2}</div>
                <div className="flex gap-2 pt-0.5 text-xs text-muted-foreground">
                  <span>Nível 1: {espNivel1}</span>
                  <span>·</span>
                  <span>Nível 2: {espNivel2}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary justify-start hover:bg-transparent"
                onClick={() => navigate({ to: "/especialidades" })}
              >
                Gerenciar especialidades →
              </Button>
            </Card>

            <Card className="p-4 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Insígnias</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalInsignias}</div>
                <p className="text-xs text-muted-foreground">Insígnias e distintivos conquistados</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary justify-start hover:bg-transparent"
                onClick={() => navigate({ to: "/insignias" })}
              >
                Ver insígnias conquistadas →
              </Button>
            </Card>
          </div>

          {/* CARTÕES DE NAVEGAÇÃO RÁPIDA */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Acesso Rápido</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                className="p-4 cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between group"
                onClick={() => navigate({ to: "/progresso" })}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-leaf/10 p-2.5 text-leaf">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      Eixos de Desenvolvimento
                    </h4>
                    <p className="text-xs text-muted-foreground">Acompanhe as progressões por áreas</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Card>

              <Card
                className="p-4 cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between group"
                onClick={() => navigate({ to: "/especialidades" })}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      Catálogo de Especialidades
                    </h4>
                    <p className="text-xs text-muted-foreground">Busque e solicite novas especialidades</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;