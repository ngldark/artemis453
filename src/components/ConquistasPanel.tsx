import { useState } from "react";
import {
  EixoProgresso,
  EspecialidadeProgresso,
  MAPA_EIXOS,
} from "@/lib/progressao";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ConquistasPanelProps {
  eixos: EixoProgresso[];
  especialidades: EspecialidadeProgresso[];
  onSelectBloco?: (blocoId: string) => void;
  onSelectEspecialidade?: (esp: EspecialidadeProgresso) => void;
}

const EIXOS_CHAVES = [
  "EIXO_HABILIDADES",
  "EIXO_MEIO_AMBIENTE",
  "EIXO_PAZ",
  "EIXO_SAUDE",
];

export function ConquistasPanel({
  eixos,
  especialidades,
  onSelectBloco,
  onSelectEspecialidade,
}: ConquistasPanelProps) {
  const [abaPrincipal, setAbaPrincipal] = useState<"eixos" | "especialidades">("eixos");
  const [eixoEspecialidadeAtivo, setEixoEspecialidadeAtivo] = useState<string>("EIXO_HABILIDADES");
  const [eixoBlocoAtivo, setEixoBlocoAtivo] = useState<string>("EIXO_HABILIDADES");
  const [buscaEspecialidade, setBuscaEspecialidade] = useState<string>("");

  const termoBusca = buscaEspecialidade.trim().toLowerCase();

  // Filtragem de especialidades por busca ou por aba de eixo
  const especialidadesFiltradas = especialidades.filter((esp) => {
    const atendeBusca = !termoBusca || esp.nome.toLowerCase().includes(termoBusca);
    const atendeEixo = termoBusca ? true : esp.eixoId.toUpperCase().trim() === eixoEspecialidadeAtivo;
    return atendeBusca && atendeEixo;
  });

  const eixoAtualBlocos = eixos.find(
    (e) => e.id.toUpperCase().trim() === eixoBlocoAtivo
  );

  return (
    <div className="space-y-6">
      {/* Abas Principais (Eixos, Blocos e Ações vs Especialidades) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setAbaPrincipal("eixos")}
          className={`pb-3 font-semibold text-sm sm:text-base border-b-2 transition-colors ${
            abaPrincipal === "eixos"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Eixos, Blocos e Ações
        </button>
        <button
          onClick={() => setAbaPrincipal("especialidades")}
          className={`pb-3 font-semibold text-sm sm:text-base border-b-2 transition-colors ${
            abaPrincipal === "especialidades"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Especialidades
        </button>
      </div>

      {/* ABA 1: EIXOS, BLOCOS E AÇÕES */}
      {abaPrincipal === "eixos" && (
        <div className="space-y-4">
          {/* Navegação de Eixos para Blocos */}
          <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {EIXOS_CHAVES.map((key) => {
              const meta = MAPA_EIXOS[key] ?? { nome: key };
              const selected = eixoBlocoAtivo === key;
              return (
                <button
                  key={key}
                  onClick={() => setEixoBlocoAtivo(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    selected
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {meta.nome}
                </button>
              );
            })}
          </div>

          {/* Lista de Blocos do Eixo Selecionado */}
          <div className="space-y-3 mt-4">
            {eixoAtualBlocos?.blocos.map((bloco) => {
              const totalGeral = bloco.fixasTotal + bloco.variaveisTotal;
              const concluidasGeral = bloco.fixasConcluidas + bloco.variaveisConcluidas;
              const percentual = totalGeral > 0 ? Math.round((concluidasGeral / totalGeral) * 100) : 0;

              // Regra da Alteração 02: Oculta 'Fixas' se for 0
              const textoProgresso = [
                bloco.fixasTotal > 0 ? `Fixas: ${bloco.fixasConcluidas}/${bloco.fixasTotal}` : null,
                `Variáveis: ${bloco.variaveisConcluidas}/${bloco.variaveisTotal}`,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  key={bloco.id}
                  onClick={() => onSelectBloco?.(bloco.id)}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-slate-900 font-semibold text-lg">{bloco.nome}</h3>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">{textoProgresso}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        percentual === 100
                          ? "bg-emerald-100 text-emerald-800"
                          : percentual > 0
                          ? "bg-teal-100 text-teal-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {percentual === 100 ? "Concluído" : percentual > 0 ? `${percentual}%` : "Não Iniciado"}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: ESPECIALIDADES */}
      {abaPrincipal === "especialidades" && (
        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar especialidade..."
              value={buscaEspecialidade}
              onChange={(e) => setBuscaEspecialidade(e.target.value)}
              className="pl-9 bg-slate-50/50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Alteração 03: Abas de Eixo para Especialidades */}
          {!termoBusca && (
            <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
              {EIXOS_CHAVES.map((key) => {
                const meta = MAPA_EIXOS[key] ?? { nome: key };
                const selected = eixoEspecialidadeAtivo === key;
                return (
                  <button
                    key={key}
                    onClick={() => setEixoEspecialidadeAtivo(key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      selected
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    {meta.nome}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cards de Especialidades */}
          <div className="space-y-3 mt-4">
            {especialidadesFiltradas.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhuma especialidade encontrada.
              </div>
            ) : (
              especialidadesFiltradas.map((esp) => {
                const temRequisitos = esp.totalRequisitos > 0;

                return (
                  <div
                    key={esp.id}
                    onClick={() => temRequisitos && onSelectEspecialidade?.(esp)}
                    className={`p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all ${
                      temRequisitos ? "cursor-pointer hover:shadow-md" : "opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                        🎖️
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{esp.nome}</h4>
                        <p className="text-xs text-slate-500">
                          {temRequisitos
                            ? `${esp.concluidosCount}/${esp.totalRequisitos} requisitos`
                            : "Sem requisitos cadastrados · Página sendo atualizada"}
                        </p>
                      </div>
                    </div>

                    <div>
                      {!temRequisitos ? (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                          Em atualização
                        </span>
                      ) : esp.nivelAtual === 2 ? (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          Nível 2
                        </span>
                      ) : esp.nivelAtual === 1 ? (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                          Nível 1
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                          Não iniciado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}