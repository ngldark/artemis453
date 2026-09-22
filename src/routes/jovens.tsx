import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import { criarJovem, atualizarJovem, removerJovem, fetchJovens, type Jovem } from "@/lib/progressao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/jovens")({
  head: () => ({
    meta: [
      { title: "Cadastro de Jovens · Progressão Escoteira" },
      { name: "description", content: "Cadastro e gestão dos jovens do Ramo Escoteiro — exclusivo da chefia." },
      { property: "og:title", content: "Cadastro de Jovens · Progressão Escoteira" },
      { property: "og:description", content: "Cadastro e gestão dos jovens do Ramo Escoteiro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JovensPage,
});

function JovensPage() {
  const { perfil } = useAppState();
  const queryClient = useQueryClient();
  const { data: jovens = [], isLoading } = useQuery({ queryKey: ["jovens"], queryFn: fetchJovens });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Jovem | null>(null);
  const [nome, setNome] = useState("");
  const [patrulha, setPatrulha] = useState("");

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["jovens"] });

  const salvar = useMutation({
    mutationFn: async () => {
      if (editando) await atualizarJovem(editando.id, nome.trim(), patrulha.trim());
      else await criarJovem(nome.trim(), patrulha.trim());
    },
    onSuccess: () => {
      toast.success(editando ? "Jovem atualizado!" : "Jovem cadastrado!");
      setDialogOpen(false);
      setEditando(null);
      setNome("");
      setPatrulha("");
      invalidar();
    },
    onError: () => toast.error("Não foi possível salvar. Tente novamente."),
  });

  const remover = useMutation({
    mutationFn: (id: string) => removerJovem(id),
    onSuccess: () => {
      toast.success("Jovem removido.");
      invalidar();
    },
    onError: () => toast.error("Não foi possível remover. Tente novamente."),
  });

  if (perfil !== "chefe") {
    return (
      <AppShell>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Tela exclusiva da chefia</p>
            <p className="text-xs text-muted-foreground">
              Alterne para a Visão do Chefe no topo da página para cadastrar jovens.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Jovens</h1>
          <p className="text-xs text-muted-foreground">{jovens.length} cadastrado(s)</p>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setNome("");
            setPatrulha("");
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Novo jovem
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : jovens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum jovem cadastrado</p>
            <p className="text-xs text-muted-foreground">Comece cadastrando o primeiro jovem da tropa.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jovens.map((j) => (
            <Card key={j.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{j.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {j.patrulha ? `Patrulha ${j.patrulha}` : "Sem patrulha"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${j.nome}`}
                    onClick={() => {
                      setEditando(j);
                      setNome(j.nome);
                      setPatrulha(j.patrulha ?? "");
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${j.nome}`}
                    onClick={() => {
                      if (window.confirm(`Remover ${j.nome}? Todo o progresso dele(a) será apagado.`)) {
                        remover.mutate(j.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar jovem" : "Novo jovem"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (nome.trim()) salvar.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="nome-jovem">Nome completo</Label>
              <Input
                id="nome-jovem"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Ana Beatriz Souza"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patrulha-jovem">Patrulha (opcional)</Label>
              <Input
                id="patrulha-jovem"
                value={patrulha}
                onChange={(e) => setPatrulha(e.target.value)}
                placeholder="Ex.: Falcão"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={!nome.trim() || salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
