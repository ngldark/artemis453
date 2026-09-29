import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  fetchJovens, 
  fetchAcolhidaCatalogo, 
  fetchAcolhidaProgresso, 
  marcarAcolhida, 
  desmarcarAcolhida,
  liberarPromessa,
  removerPromessa,
  hoje
} from '../lib/progressao';
import { ShieldCheck, CheckCircle, UserCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppState } from '@/lib/app-state';

export const Route = createFileRoute('/admin/acolhida')({
  component: AdminAcolhidaScreen,
});

function AdminAcolhidaScreen() {
  const queryClient = useQueryClient();
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();
  const [dataPromessaTemp, setDataPromessaTemp] = useState<Record<string, string>>({});

  // Buscando dados necessários
  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  const { data: catalogo = [] } = useQuery({
    queryKey: ['acolhida-catalogo'],
    queryFn: fetchAcolhidaCatalogo,
  });

  const { data: progresso = [] } = useQuery({
    queryKey: ['acolhida-progresso'],
    queryFn: () => fetchAcolhidaProgresso(),
  });

  // Mutações para salvar/remover itens de acolhida
  const marcarMutation = useMutation({
    mutationFn: (vars: { jovemId: string; itemId: string; data: string; validadoPor: string }) => 
      marcarAcolhida(vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acolhida-progresso'] }),
  });

  const desmarcarMutation = useMutation({
    mutationFn: ({ jovemId, itemId }: { jovemId: string; itemId: string }) => desmarcarAcolhida(jovemId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acolhida-progresso'] }),
  });

  const liberarPromessaMutation = useMutation({
    mutationFn: ({ jovemId, data }: { jovemId: string; data: string }) => liberarPromessa(jovemId, 'chefe', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jovens'] }),
  });

  const removerPromessaMutation = useMutation({
    mutationFn: removerPromessa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jovens'] }),
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Gestão de Acolhida</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Acompanhamento e validação das etapas iniciais e promessa escoteira.</p>
          </div>
          <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {jovens.length} Jovens na Etapa
          </div>
        </div>

        {/* Estado de Carregamento */}
        {carregandoJovens ? (
          <div className="flex justify-center items-center py-12 text-slate-500 text-sm font-medium">
            Carregando dados da acolhida...
          </div>
        ) : (
          /* Lista de Jovens na Acolhida */
          <div className="space-y-4">
            {jovens.map((jovem: any) => {
              const itensDoJovem = progresso.filter((p) => p.jovem_id === jovem.id);
              const totalConcluidos = itensDoJovem.length;
              const percentual = catalogo.length > 0 ? Math.round((totalConcluidos / catalogo.length) * 100) : 0;

              const dataPromessaSalva = jovem.data_promessa ?? '';
              const dataInputVal = dataPromessaTemp[jovem.id] !== undefined ? dataPromessaTemp[jovem.id] : dataPromessaSalva;

              return (
                <div key={jovem.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                  
                  {/* Nome e Progresso */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {jovem.nome_completo || jovem.nome || "Sem nome"}
                      </h3>
                      <span className="text-xs text-slate-500">Patrulha: <strong>{jovem.patrulha || 'Sem Patrulha'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-xs font-semibold text-slate-600">{totalConcluidos} de {catalogo.length} itens</span>
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all" style={{ width: `${percentual}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Itens do Catalogo de Acolhida */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catalogo.map((item: any) => {
                      const concluido = itensDoJovem.some((p) => String(p.item_id) === String(item.id));
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (concluido) {
                              desmarcarMutation.mutate({ jovemId: jovem.id, itemId: item.id });
                            } else {
                              marcarMutation.mutate({ jovemId: jovem.id, itemId: item.id, data: hoje(), validadoPor: 'chefe' });
                            }
                          }}
                          className={`text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                            concluido 
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                              : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${concluido ? 'text-emerald-600' : 'text-slate-300'}`} />
                          <div className="text-xs">
                            <p className="font-semibold">{item.titulo}</p>
                            {item.descricao && <p className="text-slate-500 mt-0.5">{item.descricao}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bloco de Promessa Escoteira */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <UserCheck className="w-4 h-4 text-sky-600" />
                      <span>Promessa Escoteira:</span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input 
                        type="date"
                        value={dataInputVal}
                        onChange={(e) => setDataPromessaTemp({ ...dataPromessaTemp, [jovem.id]: e.target.value })}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 w-full sm:w-auto"
                      />
                      
                      {dataInputVal ? (
                        <button
                          onClick={() => {
                            liberarPromessaMutation.mutate({ jovemId: jovem.id, data: dataInputVal });
                            setDataPromessaTemp({ ...dataPromessaTemp, [jovem.id]: '' });
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                        >
                          Salvar Promessa
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic shrink-0">Pendente</span>
                      )}

                      {dataPromessaSalva && (
                        <button
                          onClick={() => removerPromessaMutation.mutate(jovem.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-1"
                          title="Remover data de promessa"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}