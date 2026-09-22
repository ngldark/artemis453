import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import {
  fetchEixos,
  fetchBlocos,
  fetchAcoes,
  fetchAcoesProgresso,
  marcarAcao,
  desmarcarAcao,
  formatarData,
  hoje,
  type Acao,
  type Bloco,
} from "@/lib/progressao";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/eixos")({
  head: () => ({
    meta: [
      { title: "Eixos e Blocos — Progressão Escoteira" },
      {
        name: "description",
        content: "Explore os 4 eixos educativos, seus blocos e ações fixas, variáveis e de substituição.",
      },
      { property: "og:title", content: "Eixos e Blocos — Progressão Escoteira" },
      {
        property: "og:description",
        content: "Explore os 4 eixos educativos, seus blocos e ações fixas, variáveis e de substituição.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Eixos />
    </AppShell>
  ),
});

function Eixos() {
  const { jovemId } = useAppState();
  const [blocoAberto, setBlocoAberto] = useState<Bloco | null>(null);

  const { data: eixos = [] } = useQuery({ queryKey: ["eixos"], queryFn: fetchEixos });
  const { data: blocos = [] } = useQuery({ queryKey: ["blocos"], queryFn: fetchBlocos });
  const { data: acoes = [] } = useQuery({ queryKey: ["acoes"], queryFn: fetchAcoes });
  const { data: progresso = [] } = useQuery({
    queryKey: ["acoes_progresso", jovemId],
    queryFn: () => fetchAcoesProgresso(jovemId!),
    enabled: !!jovemId,
  });

  const feitas = useMemo(() => new Set(progresso.map((p) => p.acao_id)), [progresso]);

  const statusBloco = (bloco: Bloco) => {
    const doBloco = acoes.filter((a) => a.bloco_id === bloco.id && a.tipo !== "substituicao");
    const done = doBloco.filter((a) => feitas.has(a.id)).length;
    if (doBloco.length > 0 && done === doBloco.length) return { label: "Concluído", cls: "bg-leaf text-leaf-foreground" };
    if (done > 0) return { label: "Em Andamento", cls: "bg-gold text-gold-foreground" };
    return { label: "Não Iniciado", cls: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">Eixos, Blocos e Ações</h1>
        <p className="text-sm text-muted-foreground">Escolha um eixo para ver seus blocos.</p>
      </div>

      {eixos.length > 0 && (
        <Tabs defaultValue={eixos[0]!.id}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
            {eixos.map((e) => (
              <TabsTrigger key={e.id} value={e.id} className="text-xs sm:text-sm">
                {e.nome}
              </TabsTrigger>
            ))}
          </TabsList>

          {eixos.map((e) => (
            <TabsContent key={e.id} value={e.id} className="mt-4 space-y-3">
              {blocos
                .filter((b) => b.eixo_id === e.id)
                .map((b) => {
                  const st = statusBloco(b);
                  return (
                    <Card
                      key={b.id}
                      role="button"
                      onClick={() => setBlocoAberto(b)}
                      className="cursor-pointer gap-2 p-4 transition hover:border-primary/40"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <p className="truncate font-semibold">{b.nome}</p>
                        <Badge className={`shrink-0 ${st.cls}`}>{st.label}</Badge>
                      </div>
                      {b.descricao && <p className="text-sm text-muted-foreground">{b.descricao}</p>}
                    </Card>
                  );
                })}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <BlocoDialog bloco={blocoAberto} acoes={acoes} onClose={() => setBlocoAberto(null)} />
    </div>
  );
}

function BlocoDialog({
  bloco,
  acoes,
  onClose,
}: {
  bloco: Bloco | null;
  acoes: Acao[];
  onClose: () => void;
}) {
  const { perfil, jovemId, chefe, setChefe } = useAppState();
  const qc = useQueryClient();
  const [data, setData] = useState(hoje());

  const { data: progresso = [] } = useQuery({
    queryKey: ["acoes_progresso", jovemId],
    queryFn: () => fetchAcoesProgresso(jovemId!),
    enabled: !!jovemId,
  });

  const toggle = useMutation({
    mutationFn: async ({ acaoId, feito }: { acaoId: string; feito: boolean }) => {
      if (!jovemId) return;
      if (feito) await desmarcarAcao(jovemId, acaoId);
      else await marcarAcao({ jovemId, acaoId, data, validadoPor: chefe });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acoes_progresso"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!bloco) return null;
  const doBloco = acoes.filter((a) => a.bloco_id === bloco.id);

  const lista = (tipo: Acao["tipo"]) => {
    const itens = doBloco.filter((a) => a.tipo === tipo);
    if (itens.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma ação nesta categoria.</p>;
    return (
      <ul className="space-y-3">
        {itens.map((a) => {
          const reg = progresso.find((p) => p.acao_id === a.id);
          const feito = !!reg;
          return (
            <li key={a.id} className={`rounded-xl border p-3 ${feito ? "border-leaf/40 bg-leaf/5" : "border-border"}`}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
                {feito ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold leading-snug">{a.titulo}</p>
                  {a.descricao && <p className="text-xs text-muted-foreground">{a.descricao}</p>}
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
                      disabled={!jovemId || toggle.isPending}
                      onClick={() => toggle.mutate({ acaoId: a.id, feito })}
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
    );
  };

  return (
    <Dialog open={!!bloco} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{bloco.nome}</DialogTitle>
        </DialogHeader>

        {perfil === "chefe" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="acao-data">Data</Label>
              <Input id="acao-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acao-chefe">Validado por</Label>
              <Input id="acao-chefe" value={chefe} onChange={(e) => setChefe(e.target.value)} placeholder="Nome do chefe" />
            </div>
          </div>
        )}

        <Tabs defaultValue="fixa">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixa" className="text-xs">Fixas</TabsTrigger>
            <TabsTrigger value="variavel" className="text-xs">Variáveis</TabsTrigger>
            <TabsTrigger value="substituicao" className="text-xs">Regra "OU"</TabsTrigger>
          </TabsList>
          <TabsContent value="fixa" className="mt-4">{lista("fixa")}</TabsContent>
          <TabsContent value="variavel" className="mt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Ações variáveis e especialidades que somam ao bloco.
            </p>
            {lista("variavel")}
          </TabsContent>
          <TabsContent value="substituicao" className="mt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Insígnias ou Especialidades de Nível 2 podem substituir as ações fixas deste bloco.
            </p>
            {lista("substituicao")}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
