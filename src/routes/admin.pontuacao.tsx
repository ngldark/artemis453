import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJovens } from '../lib/progressao';
import { Trophy, Award, PlusCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/pontuacao')({
  component: AdminPontuacaoScreen,
});

function AdminPontuacaoScreen() {
  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  if (carregandoJovens) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50 text-slate-600">
        <p className="text-sm font-medium animate-pulse">Carregando painel de pontuação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        
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

        {/* Painel de Lançamento de Pontos */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" /> Atribuir Pontos
          </h2>
          
          <div className="text-xs text-slate-500 italic">
            Módulo de pontuação e ranking por patrulha/jovem preparado para futuras regras de jogos e atividades. ({jovens.length} jovens cadastrados).
          </div>
        </div>

      </div>
    </div>
  );
}