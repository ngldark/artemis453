import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConquistasPanel } from "@/components/ConquistasPanel";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import {
  fetchEspecialidades,
  fetchEspecialidadesItens,
  fetchProgressoEspecialidadesItens,
  fetchPromessas,
  fetchEscoteiros,
  formatarData,
  marcarEspecialidadeItem,
  desmarcarEspecialidadeItem,
} from "@/lib/progressao";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades — Progressão Escoteira" },
      { name: "description", content: "Acompanhe especialidades: Nível 1 na metade dos itens e Nível 2 com 100%." },
    ],
  }),
  component: EspecialidadesRoutePage,
});

function EspecialidadesRoutePage() {
  const navigate = useNavigate();
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();

  // Busca a lista de escoteiros para alimentar o seletor no AppShell
  const { data: escoteiros = [] } = useQuery({
    queryKey: ["escoteiros"],
    queryFn: fetchEscoteiros,
  });

  // Garante que o primeiro escoteiro fique selecionado por padrão se nenhum estiver ativo
  useEffect(() => {
    if (escoteiros.length > 0 && !jovemId) {
      setJovemId(escoteiros[0].id);
    }
  }, [escoteiros, jovemId, setJovemId]);

  const handleAbaChange = (aba: string) => {
    if (aba === "progressao") {
      navigate({ to: "/" });
    } else {
      navigate({ to: "/insignias" });
    }
  };

  return (
    <AppShell
      perfil={perfil}
      onPerfilChange={setPerfil}
      escoteiros={escoteiros}
      escoteiroSelecionadoId={jovemId}
      onEscoteiroChange={setJovemId}
      abaAtiva="conquistas"
      onAbaChange={handleAbaChange}
    >
      <EspecialidadesPage />
    </AppShell>
  );
}

function EspecialidadesPage() {
  const { jovemId } = useAppState();

  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });
  const promessa = promessas.find((p) => (p.jovem_id || p.escoteiro_id) === jovemId);

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

  if (jovemId && !promessa) {
    return (
      <Card className="gap-3 border-gold/50 bg-gold/10 p-6 text-center">
        <Lock className="mx-auto h-6 w-6 text-gold-foreground" />
        <p className="font-bold">Especialidades bloqueadas</p>
        <p className="text-sm text-muted-foreground">
          O acesso é liberado somente com a data da Promessa cadastrada no perfil.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">Especialidades</h1>
        <p className="text-sm text-muted-foreground">
          {promessa
            ? `Liberadas desde a Promessa em ${formatarData(promessa.liberada_em || promessa.data_promessa)}. Nível 1 na metade dos itens · Nível 2 com todos.`
            : "Nível 1 na metade dos itens · Nível 2 com todos."}
        </p>
      </div>

      <ConquistasPanel
        tipo="especialidade"
        catalogo={especialidades}
        itens={especialidadesItens}
        progresso={progressoEsp}
        queryProgresso="progresso_especialidades_itens"
        dataPromessa={promessa?.liberada_em || promessa?.data_promessa}
        marcar={marcarEspecialidadeItem}
        desmarcar={desmarcarEspecialidadeItem}
      />
    </div>
  );
}