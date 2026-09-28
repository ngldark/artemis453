import React from "react";
import { Compass, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Perfil } from "@/lib/progressao";

export interface AppShellProps {
  children?: React.ReactNode;
  perfil?: Perfil | string;
  currentPerfil?: Perfil | string;
  userPerfil?: Perfil | string;
  onPerfilChange?: (perfil: Perfil) => void;
  onPerfilSelect?: (perfil: Perfil) => void;
  escoteiros?: Array<{ id: string; nome: string; patrulha?: string | null }>;
  jovens?: Array<{ id: string; nome: string; patrulha?: string | null }>;
  escoteiroSelecionadoId?: string;
  selectedEscoteiroId?: string;
  escoteiroAtivoId?: string;
  onEscoteiroChange?: (id: string) => void;
  onEscoteiroSelect?: (id: string) => void;
  abaAtiva?: string;
  onAbaChange?: (aba: string) => void;
}

export function AppShell({
  children,
  perfil,
  currentPerfil,
  userPerfil,
  onPerfilChange,
  onPerfilSelect,
  escoteiros = [],
  jovens = [],
  escoteiroSelecionadoId,
  selectedEscoteiroId,
  escoteiroAtivoId,
  onEscoteiroChange,
  onEscoteiroSelect,
  abaAtiva = "progressao",
  onAbaChange,
}: AppShellProps) {
  const rawPerfil = perfil || currentPerfil || userPerfil || "CHEFE";
  const perfilUpper = String(rawPerfil).toUpperCase();

  const handlePerfilChange = (val: string) => {
    const p = val as Perfil;
    onPerfilChange?.(p);
    onPerfilSelect?.(p);
  };

  const listaJovens = escoteiros.length > 0 ? escoteiros : jovens;
  const jovemSelecionado = escoteiroSelecionadoId || selectedEscoteiroId || escoteiroAtivoId || "";

  const handleJovemChange = (id: string) => {
    onEscoteiroChange?.(id);
    onEscoteiroSelect?.(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Cabeçalho */}
      <header className="bg-teal-800 text-white px-4 py-3 shadow-md flex items-center justify-between gap-2 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <h1 className="font-bold text-lg hidden sm:block">Progressão Escoteira</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown de Perfil (Chefe / Escoteiro) */}
          <Select value={perfilUpper} onValueChange={handlePerfilChange}>
            <SelectTrigger className="w-[110px] bg-teal-700/60 border-teal-600/50 text-white font-medium focus:ring-teal-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border border-slate-200 shadow-xl rounded-lg z-50">
              <SelectItem value="CHEFE" className="text-slate-800 focus:bg-teal-50 focus:text-teal-900 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white cursor-pointer">
                Chefe
              </SelectItem>
              <SelectItem value="ESCOTEIRO" className="text-slate-800 focus:bg-teal-50 focus:text-teal-900 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white cursor-pointer">
                Escoteiro
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Dropdown de Seleção de Jovem (Exibido se perfil for CHEFE) */}
          {perfilUpper === "CHEFE" && listaJovens.length > 0 && (
            <Select value={jovemSelecionado || undefined} onValueChange={handleJovemChange}>
              <SelectTrigger className="w-[160px] sm:w-[200px] bg-teal-700/60 border-teal-600/50 text-white font-medium focus:ring-teal-400">
                <SelectValue placeholder="Selecione o jovem" />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border border-slate-200 shadow-xl rounded-lg max-h-[300px] z-50">
                {listaJovens.map((e) => (
                  <SelectItem
                    key={e.id}
                    value={e.id}
                    className="text-slate-800 focus:bg-teal-50 focus:text-teal-900 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white cursor-pointer font-medium"
                  >
                    {e.nome} {e.patrulha ? `(${e.patrulha})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4">{children}</main>

      {/* Barra Inferior Restaurada */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 flex items-center justify-around py-2 px-4">
        <button
          type="button"
          onClick={() => onAbaChange?.("progressao")}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
            abaAtiva === "progressao" ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Progressão</span>
        </button>

        <button
          type="button"
          onClick={() => onAbaChange?.("conquistas")}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
            abaAtiva === "conquistas" ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="h-5 w-5" />
          <span>Conquistas</span>
        </button>
      </nav>
    </div>
  );
}

export default AppShell;