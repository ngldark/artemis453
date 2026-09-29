import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchJovens, criarJovem, removerJovem } from '../lib/progressao';
import { Users, UserPlus, Trash2, ChevronRight, Shield } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppState } from '@/lib/app-state';

export const Route = createFileRoute('/admin/jovens')({
  component: AdminJovensScreen,
});

function AdminJovensScreen() {
  const queryClient = useQueryClient();
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();

  const [nomeNovo, setNomeNovo] = useState('');
  const [patrulhaNova, setPatrulhaNova] = useState('');
  const [registroUebNovo, setRegistroUebNovo] = useState('');

  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  const criarMutation = useMutation({
    mutationFn: criarJovem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jovens'] });
      setNomeNovo('');
      setPatrulhaNova('');
      setRegistroUebNovo('');
    },
  });

  const removerMutation = useMutation({
    mutationFn: removerJovem,
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Gestão de Jovens</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Cadastro de novos membros e gerenciamento geral da tropa.</p>
          </div>
          <div className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-200 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {jovens.length} Cadastrados
          </div>
        </div>

        {/* Formulário de Cadastro de Novo Jovem */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-sky-600" /> Cadastrar Novo Escoteiro
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              type="text"
              placeholder="Nome Completo"
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
            <input 
              type="text"
              placeholder="Patrulha (Ex: Panteras)"
              value={patrulhaNova}
              onChange={(e) => setPatrulhaNova(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
            <input 
              type="text"
              placeholder="Registro UEB (Opcional)"
              value={registroUebNovo}
              onChange={(e) => setRegistroUebNovo(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => {
              if (!nomeNovo.trim()) return;
              criarMutation.mutate({
                nome: nomeNovo,
                patrulha: patrulhaNova || null,
                registro_ueb: registroUebNovo || null,
              });
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Adicionar Jovem
          </button>
        </div>

        {/* Listagem de Jovens */}
        {carregandoJovens ? (
          <div className="flex justify-center items-center py-12 text-slate-500 text-sm font-medium">
            Carregando cadastro de jovens...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" /> Relação de Membros
              </span>
              <span className="text-xs text-slate-400">Clique para ver conquistas individuais</span>
            </div>

            <div className="divide-y divide-slate-100">
              {jovens.map((jovem: any) => (
                <div key={jovem.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {jovem.nome_completo || jovem.nome || "Sem nome"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Patrulha: <strong>{jovem.patrulha || 'Sem Patrulha'}</strong></span>
                      {jovem.registro_ueb && <span>• UEB: {jovem.registro_ueb}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const nomeExibicao = jovem.nome_completo || jovem.nome || "este jovem";
                        if (confirm(`Deseja realmente remover ${nomeExibicao}?`)) {
                          removerMutation.mutate(jovem.id);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remover jovem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
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