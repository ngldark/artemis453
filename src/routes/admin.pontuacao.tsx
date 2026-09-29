import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJovens } from '../lib/progressao';
import { Trophy, Award } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppState } from '@/lib/app-state';

export const Route = createFileRoute('/admin/pontuacao')({
  component: AdminPontuacaoScreen,
});

function AdminPontuacaoScreen() {
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();

  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  return (
    <AppShell
      perfil={perfil}
      onPerfilChange={setPerfil}
      escoteiros={jovens}
      escoteiroSelecionadoId={jovemId ?? undefined}
      onEscoteiroChange={setJovemId}
    >
      <div className="space-y-6 pb-12">
        
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Placar e Pontuação</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Gestão de pontos, premiações e pontuação dos jogos da tropa.</p>
          </div>
          <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Placar Geral
          </div>
        </div>

        {/* Estado de Carregamento / Painel de Lançamento */}
        {carregandoJovens ? (
          <div className="flex justify-center items-center py-12 text-slate-500 text-sm font-medium">
            Carregando painel de pontuação...
          </div>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" /> Atribuir Pontos
            </h2>
            
            <div className="text-xs text-slate-500 italic">
              Módulo de pontuação e ranking por patrulha/jovem preparado para futuras regras de jogos e atividades. ({jovens.length} jovens cadastrados).
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}