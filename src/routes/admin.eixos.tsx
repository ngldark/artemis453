import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchEixos, fetchBlocos } from '../lib/progressao';
import { Compass, BookOpen, Layers } from 'lucide-react';

export const Route = createFileRoute('/admin/eixos')({
  component: AdminEixosScreen,
});

function AdminEixosScreen() {
  const { data: eixos = [], isLoading: carregandoEixos } = useQuery({
    queryKey: ['eixos'],
    queryFn: fetchEixos,
  });

  const { data: blocos = [] } = useQuery({
    queryKey: ['blocos'],
    queryFn: fetchBlocos,
  });

  if (carregandoEixos) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50 text-slate-600">
        <p className="text-sm font-medium animate-pulse">Carregando eixos de desenvolvimento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Eixos de Desenvolvimento</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Supervisão dos eixos e blocos que compõem a progressão da tropa.</p>
          </div>
          <div className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> {eixos.length} Eixos Ativos
          </div>
        </div>

        {/* Lista de Eixos e seus Blocos */}
        <div className="space-y-4">
          {eixos.map((eixo) => {
            const blocosDoEixo = blocos.filter((b) => b.eixo_id === eixo.id);

            return (
              <div key={eixo.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                
                {/* Nome do Eixo */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="bg-sky-100 text-sky-700 p-2 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{eixo.nome}</h2>
                    <span className="text-xs text-slate-500">{blocosDoEixo.length} bloco(s) vinculado(s)</span>
                  </div>
                </div>

                {/* Blocos do Eixo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blocosDoEixo.map((bloco) => (
                    <div 
                      key={bloco.id} 
                      className="bg-slate-50/60 border border-slate-200/80 rounded-lg p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bloco {bloco.ordem}</span>
                          <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">
                            Meta: {bloco.meta_variaveis} variáveis
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mt-1">{bloco.nome}</h3>
                        {bloco.descricao && (
                          <p className="text-xs text-slate-500 mt-1">{bloco.descricao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {blocosDoEixo.length === 0 && (
                    <p className="text-xs text-slate-400 italic col-span-full">Nenhum bloco cadastrado para este eixo.</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}