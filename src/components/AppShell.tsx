import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Users, LayoutList, ClipboardCheck, UserPlus, LogOut, Award, Shield } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/lib/app-state";
import { fetchJovens, fetchPromessas } from "@/lib/progressao";
import { useMembro } from "@/lib/membro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Acolhida", icon: ClipboardCheck },
  { to: "/eixos", label: "Eixos", icon: LayoutList },
  { to: "/especialidades", label: "Especialid.", icon: Award },
  { to: "/insignias", label: "Insígnias", icon: Shield },
  { to: "/lote", label: "Em Lote", icon: Users, chefeOnly: true },
  { to: "/jovens", label: "Jovens", icon: UserPlus, chefeOnly: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();
  const membro = useMembro();
  const ehChefe = membro?.perfil === "CHEFE";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  const { data: jovens = [] } = useQuery({ queryKey: ["jovens"], queryFn: fetchJovens });
  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });

  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
  }

  // Identificar IDs de jovens que possuem promessa registrada
  const idsComPromessa = new Set(promessas.map((p) => p.jovem_id));

  // Filtrar os jovens aptos para a aba atual (quando o usuário é chefe)
  const jovensAptos = jovens.filter((j) => {
    if (!ehChefe || perfil !== "chefe") return true;
    if (pathname === "/eixos" || pathname === "/especialidades") {
      return idsComPromessa.has(j.id);
    }
    return true; // Na acolhida, todos aparecem
  });

  // Garantir seleção válida de jovem ao trocar de aba ou carregar
  useEffect(() => {
    if (!ehChefe && membro) {
      if (jovemId !== membro.id) setJovemId(membro.id);
      if (perfil !== "escoteiro") setPerfil("escoteiro");
      return;
    }

    if (ehChefe && perfil === "chefe") {
      const jovemAtualApto = jovensAptos.some((j) => j.id === jovemId);
      if (!jovemAtualApto && jovensAptos.length > 0) {
        setJovemId(jovensAptos[0].id);
      } else if (!jovemId && jovens[0]) {
        setJovemId(jovens[0].id);
      }
    }
  }, [pathname, jovens, promessas, jovemId, ehChefe, perfil, setJovemId, setPerfil, jovensAptos]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6" />
            <span className="font-bold">Progressão Escoteira</span>
          </div>

          <div className="flex items-center gap-2">
            {ehChefe && (
              <Select
                value={perfil}
                onValueChange={(v) => {
                  setPerfil(v as "chefe" | "escoteiro");
                }}
              >
                <SelectTrigger className="h-9 w-32 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="chefe" className="text-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">Chefe</SelectItem>
                  <SelectItem value="escoteiro" className="text-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">Escoteiro</SelectItem>
                </SelectContent>
              </Select>
            )}

            {perfil === "chefe" && jovensAptos.length > 0 && (
              <Select value={jovemId ?? ""} onValueChange={setJovemId}>
                <SelectTrigger className="h-9 w-44 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/25">
                  <SelectValue placeholder="Selecione o jovem" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  {jovensAptos.map((j) => (
                    <SelectItem key={j.id} value={j.id} className="text-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      {j.nome_guerra || j.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={sair}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card">
        <div className="mx-auto flex max-w-4xl">
          {nav
            .filter((n) => {
              if (n.chefeOnly && !(ehChefe && perfil === "chefe")) return false;
              
              // Para o CHEFE, as abas aparecem normalmente
              if (ehChefe && perfil === "chefe") {
                return true;
              }

              // Para o escoteiro logado ou visualizando: se já fez promessa, esconde a Acolhida (ou ajusta conforme regra)
              const jovemAtualParaValidar = ehChefe ? jovemId : membro?.id;
              const temPromessaJovem = jovemAtualParaValidar ? idsComPromessa.has(jovemAtualParaValidar) : false;
              
              // Se já tem promessa, esconde a Acolhida da navegação principal do jovem
              if (n.to === "/" && temPromessaJovem && !ehChefe) {
                return false;
              }

              // Onde há a verificação de eixos/especialidades, inclua também "/insignias":
              if ((n.to === "/eixos" || n.to === "/especialidades" || n.to === "/insignias") && !temPromessaJovem && !ehChefe) {
                return false;
              }

              return true;
            })
            .map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-5 w-5" />
                  {n.label}
                </Link>
              );
            })}
        </div>
      </nav>
    </div>
  );
}