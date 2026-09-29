import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJovens, hoje } from '../lib/progressao';
import { CalendarCheck, Users, CheckCircle2, XCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppState } from '@/lib/app-state';

export const Route = createFileRoute('/admin/presenca')({
  component: AdminPresencaScreen,
});

function AdminPresencaScreen() {
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Controle de Presença</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Chamada e registro de frequência da tropa para a data de hoje ({hoje()}).</p>
          </div>
          <div className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-200 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4" /> Chamada Ativa
          </div>
        </div>

        {/* Estado de Carregamento / Lista de Chamada */}
        {carregandoJovens ? (
          <div className="flex justify-center items-center py-12 text-slate-500 text-sm font-medium">
            Carregando controle de presença...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" /> Relação de Jovens ({jovens.length})
              </span>
              <span className="text-xs text-slate-400">Marque a presença de cada escoteiro</span>
            </div>

            <div className="divide-y divide-slate-100">
              {jovens.map((jovem: any) => (
                <div key={jovem.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {jovem.nome_completo || jovem.nome || "Sem nome"}
                    </h3>
                    <span className="text-xs text-slate-500">Patrulha: <strong>{jovem.patrulha || 'Sem Patrulha'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                    </button>
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Ausente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}