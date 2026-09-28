import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Layers, Award, Shield, CheckSquare, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Perfil } from "@/lib/progressao";

export interface EscoteiroItem {
  id: string;
  nome?: string;
  nome_completo?: string;
  name?: string;
  patrulha?: string | null;
}

export interface AppShellProps {
  children?: React.ReactNode;
  perfil?: Perfil | string;
  currentPerfil?: Perfil | string;
  userPerfil?: Perfil | string;
  onPerfilChange?: (perfil: Perfil) => void;
  onPerfilSelect?: (perfil: Perfil) => void;
  escoteiros?: EscoteiroItem[];
  jovens?: EscoteiroItem[];
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
}: AppShellProps) {
  const location = useLocation();
  const currentPath = location?.pathname || "/";

  const rawPerfil = perfil || currentPerfil || userPerfil || "CHEFE";
  const perfilUpper = String(rawPerfil).toUpperCase();
  const isChefe = perfilUpper === "CHEFE";

  const handlePerfilChange = (val: string) => {
    const p = val as Perfil;
    onPerfilChange?.(p);
    onPerfilSelect?.(p);
  };

  const listaJovensBruta = escoteiros.length > 0 ? escoteiros : jovens;
  const jovemSelecionado = escoteiroSelecionadoId || selectedEscoteiroId || escoteiroAtivoId || "";

  // Garante a recuperação do nome independente do campo vindo do banco
  const getNomeJovem = (jovem: EscoteiroItem) => {
    return jovem.nome || jovem.nome_completo || jovem.name || "Sem nome";
  };

  // Ordenação alfabética dos jovens pelo nome
  const listaJovens = [...listaJovensBruta].sort((a, b) => {
    const nomeA = getNomeJovem(a);
    const nomeB = getNomeJovem(b);
    return nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "base" });
  });

  const handleJovemChange = (id: string) => {
    onEscoteiroChange?.(id);
    onEscoteiroSelect?.(id);
  };

  // Mapeamento das rotas para a barra inferior (Em Lote e Jovens exclusivos para CHEFE)
  const navItems = [
    { to: "/", label: "Acolhida", icon: Compass },
    { to: "/eixos", label: "Eixos", icon: Layers },
    { to: "/especialidades", label: "Especialidades", icon: Award },
    { to: "/insignias", label: "Insígnias", icon: Shield },
    ...(isChefe ? [{ to: "/lote", label: "Em Lote", icon: CheckSquare }] : []),
    ...(isChefe ? [{ to: "/jovens", label: "Jovens", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Cabeçalho */}
      <header className="bg-teal-800 text-white px-4 py-3 shadow-md flex items-center justify-between gap-2 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <h1 className="font-bold text-lg hidden sm:block">Progressão Escoteira</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown de Perfil */}
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

          {/* Dropdown de Seleção de Jovem (Exibido para CHEFE) */}
          {isChefe && listaJovens.length > 0 && (
            <Select value={jovemSelecionado || undefined} onValueChange={handleJovemChange}>
              <SelectTrigger className="w-[170px] sm:w-[220px] bg-teal-700/60 border-teal-600/50 text-white font-medium focus:ring-teal-400 truncate">
                <SelectValue placeholder="Selecione o jovem" />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border border-slate-200 shadow-xl rounded-lg max-h-[300px] z-50">
                {listaJovens.map((e) => {
                  const nome = getNomeJovem(e);
                  return (
                    <SelectItem
                      key={e.id}
                      value={e.id}
                      className="text-slate-800 focus:bg-teal-50 focus:text-teal-900 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white cursor-pointer font-medium"
                    >
                      {nome} {e.patrulha ? `(${e.patrulha})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4">{children}</main>

      {/* Barra Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 py-2 px-2">
        <div className="max-w-3xl mx-auto flex items-center justify-around overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-teal-700 font-bold bg-teal-50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-teal-700" : "text-slate-500"}`} />
                <span className="truncate max-w-[68px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default AppShell;