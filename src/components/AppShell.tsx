import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Users, LayoutList, ClipboardCheck, UserPlus } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAppState } from "@/lib/app-state";
import { fetchJovens } from "@/lib/progressao";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nav: { to: "/" | "/eixos" | "/lote" | "/jovens"; label: string; icon: typeof Users; chefeOnly?: boolean }[] = [
  { to: "/", label: "Acolhida", icon: ClipboardCheck },
  { to: "/eixos", label: "Eixos", icon: LayoutList },
  { to: "/lote", label: "Em Lote", icon: Users, chefeOnly: true },
  { to: "/jovens", label: "Jovens", icon: UserPlus, chefeOnly: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { perfil, setPerfil, jovemId, setJovemId } = useAppState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: jovens = [] } = useQuery({ queryKey: ["jovens"], queryFn: fetchJovens });

  useEffect(() => {
    if (!jovemId && jovens[0]) setJovemId(jovens[0].id);
  }, [jovens, jovemId, setJovemId]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
                <Compass className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">Progressão Escoteira</p>
                <p className="truncate text-xs text-primary-foreground/70">Ramo Escoteiro</p>
              </div>
            </div>
            <div className="flex shrink-0 rounded-full bg-primary-foreground/15 p-1 text-xs font-semibold">
              <button
                onClick={() => setPerfil("escoteiro")}
                className={`rounded-full px-3 py-1.5 transition ${perfil === "escoteiro" ? "bg-gold text-gold-foreground" : "text-primary-foreground/80"}`}
              >
                Escoteiro
              </button>
              <button
                onClick={() => setPerfil("chefe")}
                className={`rounded-full px-3 py-1.5 transition ${perfil === "chefe" ? "bg-gold text-gold-foreground" : "text-primary-foreground/80"}`}
              >
                Chefe
              </button>
            </div>
          </div>

          <div className="mt-3">
            <Select value={jovemId ?? ""} onValueChange={(v) => setJovemId(v)}>
              <SelectTrigger className="h-10 w-full border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
                <SelectValue placeholder="Selecione o jovem" />
              </SelectTrigger>
              <SelectContent>
                {jovens.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.nome}
                    {j.patrulha ? ` · ${j.patrulha}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card">
        <div className="mx-auto flex max-w-4xl">
          {nav
            .filter((n) => !n.chefeOnly || perfil === "chefe")
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
