import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import {
  fetchJovens,
  fetchAcolhidaCatalogo,
  fetchEixos,
  fetchBlocos,
  fetchAcoesCatalogo,
  fetchAcolhidaProgresso,
  fetchAcoesProgresso,

  marcarAcolhida,
  marcarAcao,
  hoje,
} from "@/lib/progressao";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/lote")({
  head: () => ({
    meta: [
      { title: "Lançamento em Lote — Progressão Escoteira" },
      {
        name: "description",
        content: "Chefia valida um item de acolhida ou ação para vários jovens de uma só vez.",
      },
      { property: "og:title", content: "Lançamento em Lote — Progressão Escoteira" },
      {
        property: "og:description",
        content: "Chefia valida um item de acolhida ou ação para vários jovens de uma só vez.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Lote />
    </AppShell>
  ),
});

function Lote() {
  const { perfil, chefe, setChefe } = useAppState();
  const qc = useQueryClient();
  const [alvo, setAlvo] = useState<string>("");
  const [data, setData] = useState(hoje());
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const { data: jovens = [] } = useQuery({ queryKey: ["jovens"], queryFn: fetchJovens });
  const { data: itens = [] } = useQuery({ queryKey: ["acolhida_catalogo"], queryFn: fetchAcolhidaCatalogo });
  const { data: eixos = [] } = useQuery({ queryKey: ["eixos"], queryFn: fetchEixos });
  const { data: blocos = [] } = useQuery({ queryKey: ["blocos"], queryFn: fetchBlocos });
  const { data: acoes = [] } = useQuery({ queryKey: ["acoes_catalogo"], queryFn: () => fetchAcoesCatalogo() });
  const { data: progAcolhida = [] } = useQuery({
    queryKey: ["acolhida_progresso"],
    queryFn: () => fetchAcolhidaProgresso(),
  });
  const { data: progAcoes = [] } = useQuery({
    queryKey: ["acoes_progresso"],
    queryFn: () => fetchAcoesProgresso(),
  });

  const grupos = useMemo(
    () =>
      eixos.map((e) => ({
        eixo: e,
        blocos: blocos
          .filter((b) => b.eixo_id === e.id)
          .map((b) => ({ bloco: b, acoes: acoes.filter((a) => a.bloco_id === b.id) })),
      })),
    [eixos, blocos, acoes],
  );

  const pendentes = useMemo(() => {
    if (!alvo) return jovens;
    const [tipo, id] = alvo.split(":") as [string, string];
    const feitos = new Set(
      tipo === "acolhida"
        ? progAcolhida.filter((p) => p.item_id === id).map((p) => p.jovem_id)
        : progAcoes.filter((p) => p.acao_id === id).map((p) => p.jovem_id),
    );
    return jovens.filter((j) => !feitos.has(j.id));
  }, [alvo, jovens, progAcolhida, progAcoes]);


  const lancar = useMutation({
    mutationFn: async () => {
      if (!alvo || selecionados.length === 0) throw new Error("Selecione o item e ao menos um jovem.");
      const [tipo, id] = alvo.split(":") as [string, string];
      for (const jovemId of selecionados) {
        if (tipo === "acolhida") await marcarAcolhida({ jovemId, itemId: id, data, validadoPor: chefe });
        else await marcarAcao({ jovemId, acaoId: id, data, validadoPor: chefe });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["acolhida_progresso"] });
      qc.invalidateQueries({ queryKey: ["acoes_progresso"] });
      toast.success(`Lançado para ${selecionados.length} jovem(ns).`);
      setSelecionados([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (perfil !== "chefe") {
    return (
      <Card className="p-5">
        <p className="font-semibold">Área exclusiva da chefia</p>
        <p className="text-sm text-muted-foreground">
          Altere o perfil no topo para "Chefe" para usar o lançamento em lote.
        </p>
      </Card>
    );
  }

  const todos = selecionados.length === jovens.length && jovens.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">Lançamento em Lote</h1>
        <p className="text-sm text-muted-foreground">Valide um item para vários jovens de uma vez.</p>
      </div>

      <Card className="gap-4 p-4">
        <div className="space-y-1.5">
          <Label>Item de Acolhida ou Ação</Label>
          <Select value={alvo} onValueChange={setAlvo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o item" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectGroup>
                <SelectLabel>Período de Acolhida</SelectLabel>
                {itens.map((i) => (
                  <SelectItem key={i.id} value={`acolhida:${i.id}`}>
                    {i.ordem}. {i.titulo}
                  </SelectItem>
                ))}
              </SelectGroup>
              {grupos.map((g) =>
                g.blocos.map((b) => (
                  <SelectGroup key={b.bloco.id}>
                    <SelectLabel>
                      {g.eixo.nome} · {b.bloco.nome}
                    </SelectLabel>
                    {b.acoes.map((a) => (
                      <SelectItem key={a.id} value={`acao:${a.id}`}>
                        {a.tipo} {a.numero} · {a.descricao}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lote-data">Data de conclusão</Label>
            <Input id="lote-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lote-chefe">Chefe responsável</Label>
            <Input
              id="lote-chefe"
              value={chefe}
              onChange={(e) => setChefe(e.target.value)}
              placeholder="Nome do chefe"
            />
          </div>
        </div>
      </Card>

      <Card className="gap-3 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="truncate font-semibold">Jovens ({selecionados.length} selecionados)</p>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setSelecionados(todos ? [] : jovens.map((j) => j.id))}
          >
            {todos ? "Limpar" : "Todos"}
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {jovens.map((j) => {
            const checked = selecionados.includes(j.id);
            return (
              <li key={j.id}>
                <label className="flex cursor-pointer items-center gap-3 py-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      setSelecionados((prev) => (v ? [...prev, j.id] : prev.filter((x) => x !== j.id)))
                    }
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{j.nome}</span>
                    {j.patrulha && <span className="block text-xs text-muted-foreground">{j.patrulha}</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Button
        className="w-full bg-leaf text-leaf-foreground hover:bg-leaf/90"
        size="lg"
        disabled={lancar.isPending || !alvo || selecionados.length === 0}
        onClick={() => lancar.mutate()}
      >
        Lançar para {selecionados.length} jovem(ns)
      </Button>
    </div>
  );
}
