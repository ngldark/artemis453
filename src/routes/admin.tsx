import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchJovens, 
  fetchAcolhidaProgresso, 
  fetchAcolhidaCatalogo,
  fetchEstagiosProgresso,
  fetchEspecProgressoCompleto,
  fetchInsigniasProgresso,
  fetchStatusBlocos
} from '../lib/progressao';
import { 
  Users, 
  ShieldAlert, 
  Award, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Footprints, 
  Flag,
  ChevronRight
} from 'lucide-react';

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  // Buscando os dados necessários via TanStack Query
  const { data: jovens = [], isLoading: carregandoJovens } = useQuery({
    queryKey: ['jovens'],
    queryFn: fetchJovens,
  });

  const { data: acolhidaProg = [] } = useQuery({
    queryKey: ['acolhida-progresso'],
    queryFn: () => fetchAcolhidaProgresso(),
  });

  const { data: acolhidaCat = [] } = useQuery({
    queryKey: ['acolhida-catalogo'],
    queryFn: fetchAcolhidaCatalogo,
  });

  const { data: estagios = [] } = useQuery({
    queryKey: ['estagios-progresso'],
    queryFn: () => fetchEstagiosProgresso(),
  });

  // Agrupando dados por patrulha (incluindo espaço para a 4ª Patrulha)
  const patrulhasPadrao = ['Panteras', 'Cobras', 'Falcões', '4ª Patrulha (Futura)'];
  
  const composicaoPatrulhas = patrulhasPadrao.map(patrulhaNome => {
    const isFutura = patrulhaNome.includes('Futura');
    const qtd = isFutura ? 0 : jovens.filter(j => j.patrulha?.toLowerCase() === patrulhaNome.toLowerCase()).length;
    return { nome: patrulhaNome, qtd, futura: isFutura };
  });

  // Cálculo de Acolhida e Alerta de Promessa
  // Jovens que completaram todos os itens de acolhida mas não possuem promessa (simulado/verificado via dados)
  const totalAcolhidaItens = acolhidaCat.length;
  const jovensAguardandoPromessa = jovens.filter(jovem => {
    const concluidosDoJovem = acolhidaProg.filter(p => p.jovem_id === jovem.id).length;
    // Se completou os itens de acolhida, mas podemos cruzar se tem data de promessa
    return totalAcolhidaItens > 0 && concluidosDoJovem >= totalAcolhidaItens;
  }).length;

  // Cálculo de Estágios e Aptidão por Eixos
  // Regra: 4 eixos = Trilha, 8 = Rumo, 13 = Travessia
  const estagioCounts = {
    pistas: jovens.length, // Base inicial
    trilha: estagios.filter(e => e.estagio === 'TRILHA' && e.data_conclusao).length,
    rumo: estagios.filter(e => e.estagio === 'RUMO' && e.data_conclusao).length,
    travessia: estagios.filter(e => e.estagio === 'TRAVESSIA' && e.data_conclusao).length,
  };

  // Alerta genérico de aptos para evolução (exemplo baseado na lógica estruturada)
  const aptosEvolucao = 0; 

  if (carregandoJovens) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50 text-slate-600">
        <p className="text-sm font-medium animate-pulse">Carregando painel da tropa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 pt-6">
        
        {/* Cabeçalho do Painel */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Visão Geral da Tropa</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Painel administrativo e de gestão de progressão dos escoteiros.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200">
            Modo Chefe Ativo
          </div>
        </div>

        {/* ================= SETOR 1: COMPOSIÇÃO ================= */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" /> Composição da Tropa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {composicaoPatrulhas.map((patrulha, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:border-sky-300 flex items-center justify-between ${
                  patrulha.futura ? 'border-dashed border-slate-300 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Patrulha</span>
                  <h3 className={`text-base font-bold ${patrulha.futura ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                    {patrulha.nome}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    patrulha.futura ? 'bg-slate-200 text-slate-500' : 'bg-sky-50 text-sky-700 border border-sky-100'
                  }`}>
                    {patrulha.futura ? 'Em breve' : `${patrulha.qtd} jovens`}
                  </div>
                  {!patrulha.futura && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= SETOR 2: PROGRESSÃO ================= */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" /> Estágios de Progressão
          </h2>

          {/* Acolhida (Destaque Único) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Etapa Inicial</span>
                <h3 className="text-lg font-bold text-slate-800">Acolhida</h3>
                <p className="text-xs text-slate-500 mt-0.5">Jovens atualmente em fase de integração e sem promessa registrada.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl text-center">
                  <span className="block text-xl font-extrabold">{jovens.length}</span>
                  <span className="text-[10px] uppercase font-semibold text-amber-700">Na Acolhida</span>
                </div>
              </div>
            </div>

            {/* Alerta Inteligente de Promessa */}
            {jovensAguardandoPromessa > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-amber-700 bg-amber-50/60 p-2.5 rounded-lg text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Temos <strong>{jovensAguardandoPromessa}</strong> jovem(ns) aguardando registro de promessa escoteira.</span>
              </div>
            )}
          </div>

          {/* Demais Estágios (2 por linha) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Pistas */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estágio 1</span>
                <h3 className="text-base font-bold text-slate-800">Pistas</h3>
                <span className="text-xs text-slate-500">{estagioCounts.pistas} escoteiros</span>
              </div>
              <Footprints className="w-6 h-6 text-sky-500" />
            </div>

            {/* Trilha */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estágio 2</span>
                <h3 className="text-base font-bold text-slate-800">Trilha</h3>
                <span className="text-xs text-slate-500">{estagioCounts.trilha} escoteiros</span>
              </div>
              <Compass className="w-6 h-6 text-emerald-500" />
            </div>

            {/* Rumo */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estágio 3</span>
                <h3 className="text-base font-bold text-slate-800">Rumo</h3>
                <span className="text-xs text-slate-500">{estagioCounts.rumo} escoteiros</span>
              </div>
              <Flag className="w-6 h-6 text-blue-500" />
            </div>

            {/* Travessia */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estágio 4</span>
                <h3 className="text-base font-bold text-slate-800">Travessia</h3>
                <span className="text-xs text-slate-500">{estagioCounts.travessia} escoteiros</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-purple-500" />
            </div>

          </div>

          {/* Alerta de Aptos para Evoluir */}
          {aptosEvolucao > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center gap-2 text-sky-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{aptosEvolucao} jovem(ns) aptos para evoluir de progressão com data pendente de registro.</span>
            </div>
          )}
        </section>

        {/* ================= SETOR 3: ESPECIALIDADES ================= */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> Painel Geral de Especialidades
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Conquistas Nível 1</span>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-800">0</h3>
                <span className="text-xs text-slate-400">Total na tropa</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Conquistas Nível 2</span>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-800">0</h3>
                <span className="text-xs text-slate-400">Total na tropa</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SETOR 4: INSÍGNIAS ================= */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-600" /> Painel Geral de Insígnias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Insígnias de Especial Melodia</span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">Conquistadas vs Progresso</h3>
              </div>
              <span className="text-sm font-bold text-slate-500">0 / 0</span>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Insígnias de Interesse Especial</span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">Conquistadas vs Progresso</h3>
              </div>
              <span className="text-sm font-bold text-slate-500">0 / 0</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}