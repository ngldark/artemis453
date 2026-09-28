import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Users, LayoutList, ClipboardCheck, UserPlus, LogOut, Award } from "lucide-react";
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
  }, [pathname, jovens, promessas, jovemId, ehChefe, perfil]);

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
                <SelectContent>
                  <SelectItem value="chefe">Chefe</SelectItem>
                  <SelectItem value="escoteiro">Escoteiro</SelectItem>
                </SelectContent>
              </Select>
            )}

            {perfil === "chefe" && jovensAptos.length > 0 && (
              <Select value={jovemId ?? ""} onValueChange={setJovemId}>
                <SelectTrigger className="h-9 w-44 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                  <SelectValue placeholder="Selecione o jovem" />
                </SelectTrigger>
                <SelectContent>
                  {jovensAptos.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
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
              
              // Para o CHEFE, as abas de Eixos e Especialidades aparecem SEMPRE
              if (ehChefe && perfil === "chefe") {
                return true;
              }

              // Para o escoteiro, esconde se não tiver promessa
              const temPromessaJovem = idsComPromessa.has(jovemId);
              if ((n.to === "/eixos" || n.to === "/especialidades") && !temPromessaJovem) {
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
                  className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
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