import React from "react";
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
}: AppShellProps) {
  const perfilAtivo = (perfil || currentPerfil || userPerfil || "CHEFE") as Perfil;

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-800 text-white px-4 py-3 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <h1 className="font-bold text-lg hidden sm:block">Progressão Escoteira</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={perfilAtivo} onValueChange={handlePerfilChange}>
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

          {perfilAtivo === "CHEFE" && listaJovens.length > 0 && (
            <Select value={jovemSelecionado} onValueChange={handleJovemChange}>
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

      <main className="flex-1 max-w-5xl w-full mx-auto p-4">{children}</main>
    </div>
  );
}

export default AppShell;