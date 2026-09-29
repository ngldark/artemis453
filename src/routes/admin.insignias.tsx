import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJovens } from '../lib/progressao';
import { Award, UserCheck } from 'lucide-react';

export const Route = createFileRoute('/admin/insignias')({
  component: AdminInsigniasScreen,
});

function AdminInsigniasScreen() {
  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  if (carregandoJovens) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50 text-slate-600">
        <p className="text-sm font-medium animate-pulse">Carregando insígnias da tropa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Gestão de Insígnias</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Acompanhamento e supervisão das insígnias de interesse especial e modalidade.</p>
          </div>
          <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-200 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Supervisão Geral
          </div>
        </div>

        {/* Painel de Acompanhamento por Jovem */}
        <div className="space-y-4">
          {jovens.map((jovem) => (
            <div key={jovem.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{jovem.nome}</h3>
                  <span className="text-xs text-slate-500">Patrulha: <strong>{jovem.patrulha || 'Sem Patrulha'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ver Progresso de Insígnias</span>
                </div>
              </div>

              {/* Espaço reservado para listagem de insígnias do jovem */}
              <div className="text-xs text-slate-500 italic py-2">
                Nenhuma insígnia em progresso ou conquistada listada no momento.
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}