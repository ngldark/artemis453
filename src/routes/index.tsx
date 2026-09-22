import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Award } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import {
  fetchAcolhidaCatalogo,
  fetchAcolhidaProgresso,
  fetchPromessas,
  marcarAcolhida,
  desmarcarAcolhida,
  liberarPromessa,
  removerPromessa,
  formatarData,
  hoje,
} from "@/lib/progressao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Período de Acolhida — Progressão Escoteira" },
      {
        name: "description",
        content: "Acompanhe os 7 itens do Período de Acolhida do Ramo Escoteiro e a liberação da Promessa.",
      },
      { property: "og:title", content: "Período de Acolhida — Progressão Escoteira" },
      {
        property: "og:description",
        content: "Acompanhe os 7 itens do Período de Acolhida do Ramo Escoteiro e a liberação da Promessa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Acolhida />
    </AppShell>
  ),
});

function Acolhida() {
  const { perfil, jovemId, chefe, setChefe } = useAppState();
  const qc = useQueryClient();
  const [data, setData] = useState(hoje());
  const [dataPromessa, setDataPromessa] = useState(hoje());

  const { data: itens = [] } = useQuery({ queryKey: ["acolhida_catalogo"], queryFn: fetchAcolhidaCatalogo });
  const { data: progresso = [] } = useQuery({
    queryKey: ["acolhida_progresso", jovemId],
    queryFn: () => fetchAcolhidaProgresso(jovemId!),
    enabled: !!jovemId,
  });
  const { data: promessas = [] } = useQuery({ queryKey: ["promessas"], queryFn: fetchPromessas });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["acolhida_progresso"] });
    qc.invalidateQueries({ queryKey: ["promessas"] });
  };

  const toggle = useMutation({
    mutationFn: async (item: { id: string; feito: boolean }) => {
      if (!jovemId) return;
      if (item.feito) await desmarcarAcolhida(jovemId, item.id);
      else await marcarAcolhida({ jovemId, itemId: item.id, data, validadoPor: chefe });
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const promessa = useMutation({
    mutationFn: async () => {
      if (!jovemId) return;
      await liberarPromessa(jovemId, chefe, dataPromessa);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Data da Promessa registrada — Eixos liberados!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async () => {
      if (!jovemId) return;
      await removerPromessa(jovemId);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Promessa desfeita.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const feitos = progresso.length;
  const total = itens.length || 7;
  const pct = Math.round((feitos / total) * 100);
  const completo = feitos >= total && total > 0;
  const promessaLiberada = promessas.find((p) => p.jovem_id === jovemId);

  useEffect(() => {
    setDataPromessa(promessaLiberada?.liberada_em ?? hoje());
  }, [promessaLiberada?.liberada_em, jovemId]);

  return (
    <div className="space-y-5">
      <Card className="gap-3 border-leaf/30 p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">Período de Acolhida</h1>
            <p className="text-sm text-muted-foreground">Os 7 passos antes da Promessa</p>
          </div>
          <span className="shrink-0 rounded-xl bg-leaf px-3 py-1.5 text-sm font-bold text-leaf-foreground">
            {feitos}/{total} · {pct}%
          </span>
        </div>
        <Progress value={pct} className="h-2.5" />
      </Card>

      {perfil === "chefe" && (
        <Card className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="data">Data de realização</Label>
            <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chefe">Validado por</Label>
            <Input
              id="chefe"
              placeholder="Nome do chefe responsável"
              value={chefe}
              onChange={(e) => setChefe(e.target.value)}
            />
          </div>
        </Card>
      )}

      <ul className="space-y-3">
        {itens.map((item) => {
          const reg = progresso.find((p) => p.item_id === item.id);
          const feito = !!reg;
          return (
            <li key={item.id}>
              <Card
                className={`gap-2 p-4 ${feito ? "border-leaf/40 bg-leaf/5" : ""}`}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  {feito ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold leading-snug">
                      {item.ordem}. {item.titulo}
                    </p>
                    {item.descricao && (
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {feito ? (
                        <>
                          <Badge className="bg-leaf text-leaf-foreground hover:bg-leaf">✓ Concluído</Badge>
                          <span className="text-xs text-muted-foreground">
                            em {formatarData(reg!.data_realizacao)}
                          </span>
                          {perfil === "chefe" && reg?.validado_por && (
                            <span className="text-xs text-muted-foreground">
                              · validado por {reg.validado_por}
                            </span>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </div>
                    {perfil === "chefe" && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant={feito ? "outline" : "default"}
                          disabled={!jovemId || toggle.isPending}
                          onClick={() => toggle.mutate({ id: item.id, feito })}
                        >
                          {feito ? "Desmarcar" : "Marcar como concluído"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <Card className="gap-3 border-gold/50 bg-gold/10 p-5">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 shrink-0 text-gold-foreground" />
          <p className="font-bold">Promessa Escoteira</p>
        </div>
        {promessaLiberada ? (
          <>
            <p className="text-sm">
              Promessa feita em {formatarData(promessaLiberada.liberada_em)}
              {perfil === "chefe" && promessaLiberada.liberada_por
                ? ` · registrada por ${promessaLiberada.liberada_por}`
                : ""}
              . Os Eixos estão liberados.
            </p>
            {perfil === "chefe" && (
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="data-promessa-edit">Data da Promessa</Label>
                  <Input
                    id="data-promessa-edit"
                    type="date"
                    value={dataPromessa}
                    onChange={(e) => setDataPromessa(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                    disabled={!jovemId || promessa.isPending}
                    onClick={() => promessa.mutate()}
                  >
                    Salvar data
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!jovemId || remover.isPending}
                    onClick={() => remover.mutate()}
                  >
                    Desfazer
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {completo
                ? "Todos os 7 itens concluídos — informe a data da Promessa para liberar os Eixos."
                : `Faltam ${total - feitos} item(ns) para registrar a Promessa.`}
            </p>
            {perfil === "chefe" && (
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="data-promessa">Data da Promessa</Label>
                  <Input
                    id="data-promessa"
                    type="date"
                    value={dataPromessa}
                    onChange={(e) => setDataPromessa(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                  disabled={!completo || !jovemId || !dataPromessa || promessa.isPending}
                  onClick={() => promessa.mutate()}
                >
                  Registrar Promessa
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
