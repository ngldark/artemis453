import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, CheckCircle2, Circle, Medal, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/lib/app-state";
import { supabase } from "@/integrations/supabase/client";
import {
  AVISO_CATALOGO_VAZIO,
  mensagemConquista,
  statusConquista,
  visualConquista,
  type TipoConquista,
} from "@/lib/conquistas";
import {
  formatarData,
  hoje,
  type CatalogoConquista,
  type ItemConquista,
  type ProgressoItemConquista,
} from "@/lib/progressao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Props = {
  tipo: TipoConquista;
  catalogo: CatalogoConquista[];
  itens: ItemConquista[];
  progresso: ProgressoItemConquista[];
  queryProgresso: string;
  dataPromessa?: string | null; // Adicionado para receber a trava da promessa
  marcar: (input: { jovemId: string; itemId: string; data: string; validadoPor: string }) => Promise<void>;
  desmarcar: (jovemId: string, itemId: string) => Promise<void>;
};

export function ConquistasPanel({ tipo, catalogo, itens, progresso, queryProgresso, dataPromessa, marcar, desmarcar }: Props) {
  const { perfil, jovemId } = useAppState();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<CatalogoConquista | null>(null);
  const [data, setData] = useState(hoje());
  const [nomeChefe, setNomeChefe] = useState("Chefia");

  // Hard Dependency da Promessa
  const temPromessa = Boolean(dataPromessa);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const nomeMeta = user.user_metadata?.["full_name"] || user.user_metadata?.["name"];
      if (nomeMeta) {
        setNomeChefe(String(nomeMeta));
      } else if (user.email) {
        const usuarioEmail = user.email.split("@")[0] ?? "";
        setNomeChefe(usuarioEmail.charAt(0).toUpperCase() + usuarioEmail.slice(1));
      }
    });
  }, []);

  const feitosPorItem = useMemo(() => {
    const m = new Map<string, ProgressoItemConquista>();
    progresso.forEach((p) => m.set(p.item_id, p));
    return m;
  }, [progresso]);

  const itensPorCatalogo = useMemo(() => {
    const m = new Map<string, ItemConquista[]>();
    itens.forEach((item) => {
      const lista = m.get(item.catalogo_id) ?? [];
      lista.push(item);
      m.set(item.catalogo_id, lista);
    });
    return m;
  }, [itens]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return catalogo;
    return catalogo.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.categoria ?? "").toLowerCase().includes(q) ||
        (c.descricao ?? "").toLowerCase().includes(q),
    );
  }, [busca, catalogo]);

  const grupos = useMemo(() => {
    const map = new Map<string, CatalogoConquista[]>();
    filtrados.forEach((c) => {
      const key = c.categoria || "Geral";
      const lista = map.get(key) ?? [];
      lista.push(c);
      map.set(key, lista);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [filtrados]);

  const toggle = useMutation({
    mutationFn: async (item: { id: string; feito: boolean; catalogoId: string }) => {
      if (!jovemId || !temPromessa) return { subiu: null as string | null };
      const doCatalogo = itensPorCatalogo.get(item.catalogoId) ?? [];
      const total = doCatalogo.length;
      const feitosAntes = doCatalogo.filter((i) => feitosPorItem.has(i.id)).length;
      const statusAntes = statusConquista(feitosAntes, total);

      if (item.feito) await desmarcar(jovemId, item.id);
      else await marcar({ jovemId, itemId: item.id, data, validadoPor: nomeChefe });

      const feitosDepois = item.feito ? Math.max(0, feitosAntes - 1) : feitosAntes + 1;
      const statusDepois = statusConquista(feitosDepois, total);
      const msg = mensagemConquista(tipo, statusDepois);
      const subiu = !item.feito && msg && statusDepois !== statusAntes ? msg : null;
      return { subiu };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [queryProgresso] });
      if (res?.subiu) toast.success(res.subiu);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Se o jovem não tiver Promessa, bloqueia o painel visualmente
  if (!temPromessa) {
    return (
      <Card className="gap-4 p-8 text-center border-amber-300 bg-amber-50/50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-amber-900">Acesso Restrito por Promessa</h3>
          <p className="text-sm text-amber-800">
            O jovem selecionado ainda não possui a data da Promessa cadastrada no perfil. É obrigatório registrar a Promessa Escoteira para iniciar especialidades e insígnias.
          </p>
        </div>
      </Card>
    );
  }

  if (catalogo.length === 0) {
    return (
      <Card className="gap-2 p-6 text-center">
        <p className="text-sm text-muted-foreground">{AVISO_CATALOGO_VAZIO}</p>
      </Card>
    );
  }

  const tituloAberto = aberto?.nome ?? "";
  const itensAbertos = aberto ? (itensPorCatalogo.get(aberto.id) ?? []) : [];
  const feitosAbertos = itensAbertos.filter((i) => feitosPorItem.has(i.id)).length;
  const statusAberto = statusConquista(feitosAbertos, itensAbertos.length);
  const visualAberto = visualConquista(statusAberto);
  const avisoAberto = mensagemConquista(tipo, statusAberto);

  return (
    <div className="space-y-4">
      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={`Buscar ${tipo === "especialidade" ? "especialidade" : "insígnia"}...`}
      />

      {grupos.map(([grupo, lista]) => (
        <section key={grupo} className="space-y-2">
          {grupos.length > 1 && <h2 className="text-sm font-semibold text-muted-foreground">{grupo}</h2>}
          {lista.map((c) => {
            const doCatalogo = itensPorCatalogo.get(c.id) ?? [];
            const total = doCatalogo.length;
            const feitos = doCatalogo.filter((i) => feitosPorItem.has(i.id)).length;
            const status = statusConquista(feitos, total);
            const visual = visualConquista(status);
            const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
            const Icon = tipo === "especialidade" ? Award : Medal;
            return (
              <Card
                key={c.id}
                role="button"
                onClick={() => setAberto(c)}
                className={`cursor-pointer gap-2 p-4 transition hover:border-primary/40 ${visual.card}`}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl ${visual.badge}`}
                  >
                    {c.imagem ? (
                      <img src={c.imagem} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {total > 0 ? `${feitos}/${total} requisitos` : "Sem requisitos cadastrados"}
                    </p>
                  </div>
                  <Badge className={`shrink-0 ${visual.badge}`}>{visual.label}</Badge>
                </div>
                {status === "sem_itens" ? (
                  <p className="text-xs text-muted-foreground">{AVISO_CATALOGO_VAZIO}</p>
                ) : (
                  <Progress value={pct} className={`h-1.5 ${visual.trilha}`} indicatorClassName={visual.barra} />
                )}
              </Card>
            );
          })}
        </section>
      ))}

      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">{tituloAberto}</DialogTitle>
          </DialogHeader>

          {statusAberto === "sem_itens" ? (
            <p className="text-sm text-muted-foreground">{AVISO_CATALOGO_VAZIO}</p>
          ) : (
            <>
              {avisoAberto && (
                <div className={`rounded-xl border px-3 py-2 text-sm font-semibold ${visualAberto.card}`}>
                  {avisoAberto}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {feitosAbertos}/{itensAbertos.length} requisitos · Nível 1 ao cumprir metade · Nível 2 ao cumprir todos
              </p>
              <Progress
                value={itensAbertos.length ? Math.round((feitosAbertos / itensAbertos.length) * 100) : 0}
                className={`h-2 ${visualAberto.trilha}`}
                indicatorClassName={visualAberto.barra}
              />
            </>
          )}

          {perfil === "chefe" && itensAbertos.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="conquista-data">Data</Label>
                <Input id="conquista-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Validado por</Label>
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  {nomeChefe} (automático)
                </div>
              </div>
            </div>
          )}

          {itensAbertos.length > 0 && (
            <ul className="space-y-3">
              {itensAbertos.map((item) => {
                const reg = feitosPorItem.get(item.id);
                const feito = !!reg;
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border p-3 ${feito ? "border-leaf/40 bg-leaf/5" : "border-border"}`}
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
                      {feito ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold leading-snug">
                          {item.ordem > 0 ? `${item.ordem}. ` : ""}
                          {item.descricao}
                        </p>
                        {feito && (
                          <p className="text-xs text-muted-foreground">
                            Concluído em {formatarData(reg!.data_realizacao)}
                            {perfil === "chefe" && reg?.validado_por ? ` · validado por ${reg.validado_por}` : ""}
                          </p>
                        )}
                        {perfil === "chefe" && (
                          <Button
                            size="sm"
                            variant={feito ? "outline" : "default"}
                            className="mt-1"
                            disabled={!jovemId || !temPromessa || toggle.isPending}
                            onClick={() =>
                              toggle.mutate({ id: item.id, feito, catalogoId: aberto!.id })
                            }
                          >
                            {feito ? "Desmarcar" : "Marcar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}