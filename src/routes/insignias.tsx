import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConquistasPanel } from "@/components/ConquistasPanel";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import {
  fetchInsignias,
  fetchInsigniasItens,
  fetchProgressoInsigniasItens,
  fetchPromessas,
  formatarData,
  marcarInsigniaItem,
  desmarcarInsigniaItem,
} from "@/lib/progressao";

export const Route = createFileRoute("/insignias")({
  head: () => ({
    meta: [
      { title: "Insígnias — Progressão Escoteira" },
      { name: "description", content: "Acompanhe as insígnias da Progressão Escoteira." },
    ],
  }),
  component: () => (
    <AppShell>
      <InsigniasPage />
    </AppShell>
  ),
});

function InsigniasPage() {
  const { jovemId } = useAppState();
  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });
  const promessa = promessas.find((p) => p.jovem_id === jovemId);

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
        <p className="font-bold">Insígnias bloqueadas</p>
        <p className="text-sm text-muted-foreground">
          O acesso é liberado somente com a data da Promessa cadastrada no perfil.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">Insígnias</h1>
        <p className="text-sm text-muted-foreground">
          {promessa
            ? `Liberadas desde a Promessa em ${formatarData(promessa.liberada_em)}.`
            : "Acompanhe os requisitos das insígnias."}
        </p>
      </div>

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
    </div>
  );
}