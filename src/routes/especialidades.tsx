import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConquistasPanel } from "@/components/ConquistasPanel";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import {
  fetchEspecialidades,
  fetchEspecialidadesItens,
  fetchInsignias,
  fetchInsigniasItens,
  fetchProgressoEspecialidadesItens,
  fetchProgressoInsigniasItens,
  fetchPromessas,
  formatarData,
  marcarEspecialidadeItem,
  desmarcarEspecialidadeItem,
  marcarInsigniaItem,
  desmarcarInsigniaItem,
} from "@/lib/progressao";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades e Insígnias — Progressão Escoteira" },
      {
        name: "description",
        content: "Acompanhe especialidades e insígnias: Nível 1 na metade dos itens e Nível 2 com 100%.",
      },
      { property: "og:title", content: "Especialidades e Insígnias — Progressão Escoteira" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <AppShell>
      <EspecialidadesPage />
    </AppShell>
  ),
});

function EspecialidadesPage() {
  const { jovemId } = useAppState();
  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });
  const promessa = promessas.find((p) => p.jovem_id === jovemId);

  const { data: especialidades = [] } = useQuery({ queryKey: ["especialidades"], queryFn: fetchEspecialidades });
  const { data: especialidadesItens = [] } = useQuery({
    queryKey: ["especialidades_itens"],
    queryFn: fetchEspecialidadesItens,
  });
  const { data: progressoEsp = [] } = useQuery({
    queryKey: ["progresso_especialidades_itens", jovemId],
    queryFn: () => fetchProgressoEspecialidadesItens(jovemId!),
    enabled: !!jovemId,
  });

  const { data: insignias = [] } = useQuery({ queryKey: ["insignias"], queryFn: fetchInsignias });
  const { data: insigniasItens = [] } = useQuery({
    queryKey: ["insignias_itens"],
    queryFn: fetchInsigniasItens,
  });
  const { data: progressoIns = [] } = useQuery({
    queryKey: ["progresso_insignias_itens", jovemId],
    queryFn: () => fetchProgressoInsigniasItens(jovemId!),
    enabled: !!jovemId,
  });

  if (jovemId && !promessa) {
    return (
      <Card className="gap-3 border-gold/50 bg-gold/10 p-6 text-center">
        <Lock className="mx-auto h-6 w-6 text-gold-foreground" />
        <p className="font-bold">Especialidades e Insígnias bloqueadas</p>
        <p className="text-sm text-muted-foreground">
          O acesso é liberado somente com a data da Promessa cadastrada no perfil. Registre a Promessa na tela de
          Acolhida para começar.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">Especialidades e Insígnias</h1>
        <p className="text-sm text-muted-foreground">
          {promessa
            ? `Liberadas desde a Promessa em ${formatarData(promessa.liberada_em)}. Nível 1 na metade dos itens · Nível 2 com todos.`
            : "Nível 1 na metade dos itens · Nível 2 com todos."}
        </p>
      </div>

      <Tabs defaultValue="especialidades">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
          <TabsTrigger value="insignias">Insígnias</TabsTrigger>
        </TabsList>
        <TabsContent value="especialidades" className="mt-4">
          <ConquistasPanel
            tipo="especialidade"
            catalogo={especialidades}
            itens={especialidadesItens}
            progresso={progressoEsp}
            queryProgresso="progresso_especialidades_itens"
            dataPromessa={promessa?.liberada_em}
            marcar={marcarEspecialidadeItem}
            desmarcar={desmarcarEspecialidadeItem}
          />
        </TabsContent>
        <TabsContent value="insignias" className="mt-4">
          <ConquistasPanel
            tipo="insignia"
            catalogo={insignias}
            itens={insigniasItens}
            progresso={progressoIns}
            queryProgresso="progresso_insignias_itens"
            dataPromessa={promessa?.liberada_em}
            marcar={marcarInsigniaItem}
            desmarcar={desmarcarInsigniaItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}