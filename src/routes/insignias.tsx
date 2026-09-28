import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConquistasPanel } from "@/components/ConquistasPanel";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import {
  fetchPromessas,
  fetchJovens,
  fetchInsigniasProgressoCompleto,
  formatarData,
} from "@/lib/progressao";

export const Route = createFileRoute("/insignias")({
  head: () => ({
    meta: [
      { title: "Insígnias — Progressão Escoteira" },
      { name: "description", content: "Acompanhe as insígnias da Progressão Escoteira." },
    ],
  }),
  component: InsigniasRoutePage,
});

function InsigniasRoutePage() {
  const navigate = useNavigate();
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();

  // Busca a lista de jovens para alimentar o seletor no AppShell
  const { data: jovens = [] } = useQuery({
    queryKey: ["jovens"],
    queryFn: fetchJovens,
  });

  // Garante que o primeiro jovem fique selecionado por padrão se nenhum estiver ativo
  useEffect(() => {
    if (jovens.length > 0 && !jovemId) {
      setJovemId(jovens[0].id);
    }
  }, [jovens, jovemId, setJovemId]);

  const handleAbaChange = (aba: string) => {
    if (aba === "progressao") {
      navigate({ to: "/" });
    } else {
      navigate({ to: "/especialidades" });
    }
  };

  return (
    <AppShell
      perfil={perfil}
      onPerfilChange={setPerfil}
      escoteiros={jovens}
      escoteiroSelecionadoId={jovemId}
      onEscoteiroChange={setJovemId}
      abaAtiva="conquistas"
      onAbaChange={handleAbaChange}
    >
      <InsigniasPage />
    </AppShell>
  );
}

function InsigniasPage() {
  const { jovemId } = useAppState();
  const navigate = useNavigate();

  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });
  const promessa = promessas.find((p) => (p.jovem_id || p.escoteiro_id) === jovemId);

  // Busca o progresso detalhado das insígnias para o jovem selecionado
  const { data: insigniasProgresso = [] } = useQuery({
    queryKey: ["insignias_progresso_completo", jovemId],
    queryFn: () => fetchInsigniasProgressoCompleto(jovemId!),
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
            ? `Liberadas desde a Promessa em ${formatarData(promessa.liberada_em || promessa.data_promessa)}.`
            : "Acompanhe os requisitos das insígnias."}
        </p>
      </div>

      <ConquistasPanel
        eixos={[]}
        especialidades={insigniasProgresso}
        onSelectEspecialidade={(ins) => {
          navigate({ to: "/insignia/$id", params: { id: ins.id } });
        }}
      />
    </div>
  );
}