import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJovens } from '../lib/progressao';
import { Award, UserCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppState } from '@/lib/app-state';

export const Route = createFileRoute('/admin/especialidades')({
  component: AdminEspecialidadesScreen,
});

function AdminEspecialidadesScreen() {
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Gestão de Especialidades</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Acompanhamento e supervisão das especialidades conquistadas pela tropa.</p>
          </div>
          <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-200 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Supervisão Geral
          </div>
        </div>

        {/* Estado de Carregamento / Listagem */}
        {carregandoJovens ? (
          <div className="flex justify-center items-center py-12 text-slate-500 text-sm font-medium">
            Carregando jovens do Supabase…
          </div>
        ) : jovens.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500">
            Nenhum jovem encontrado no banco de dados do Supabase. Verifique a conexão ou tabela.
          </div>
        ) : (
          <div className="space-y-4">
            {jovens.map((jovem: any) => (
              <div key={jovem.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {jovem.nome_completo || jovem.nome || "Sem nome"}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Patrulha: <strong>{jovem.patrulha || 'Sem Patrulha'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Visualizar Especialidades</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 italic py-2">
                  Gerenciamento de especialidades individuais (Nível 1 e 2).
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}