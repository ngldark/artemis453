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
  fetchEspecProgressoCompleto,
  formatarData,
  Promessa,
  Jovem,
  EspecialidadeProgresso,
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

  // Busca a lista de escoteiros usando fetchJovens para compatibilidade de tipos
  const { data: escoteiros = [] } = useQuery<Jovem[]>({
    queryKey: ["escoteiros"],
    queryFn: fetchJovens,
  });

  // Garante que o primeiro escoteiro fique selecionado por padrão se nenhum estiver ativo
  useEffect(() => {
    if (escoteiros && escoteiros.length > 0 && !jovemId) {
      setJovemId(escoteiros[0]?.id ?? null);
    }
  }, [escoteiros, jovemId, setJovemId]);

  return (
    <AppShell
      perfil={perfil}
      onPerfilChange={setPerfil}
      escoteiros={escoteiros}
      escoteiroSelecionadoId={jovemId ?? ""}
      onEscoteiroChange={setJovemId}
    >
      <EspecialidadesPage />
    </AppShell>
  );
}

function EspecialidadesPage() {
  const { jovemId } = useAppState();
  const navigate = useNavigate();

  const { data: promessas = [] } = useQuery<Promessa[]>({
    queryKey: ["promessas"],
    queryFn: fetchPromessas,
  });
  
  const promessa = promessas.find((p: Promessa) => p.jovem_id === jovemId);

  // Busca o progresso detalhado das especialidades para o jovem selecionado
  const { data: especialidadesProgresso = [] } = useQuery<EspecialidadeProgresso[]>({
    queryKey: ["especialidades_progresso_completo", jovemId],
    queryFn: () => fetchEspecProgressoCompleto(jovemId!),
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
            ? `Liberadas desde a Promessa em ${formatarData(promessa.liberada_em)}. Nível 1 na metade dos itens · Nível 2 com todos.`
            : "Nível 1 na metade dos itens · Nível 2 com todos."}
        </p>
      </div>

      <ConquistasPanel
        eixos={[]}
        especialidades={especialidadesProgresso}
        onSelectEspecialidade={(esp) => {
          navigate({ 
            to: "/especialidade/$id" as any, 
            params: { id: esp.id } as any
          });
        }}
      />
    </div>
  );
}