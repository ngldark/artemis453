import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, UserPlus, Users, X, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/app-state";
import { criarJovem, atualizarJovem, removerJovem, fetchJovens, type Jovem } from "@/lib/progressao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  
  // Estado para Seleção em Lote
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["jovens"] });

  const salvar = useMutation({
    mutationFn: async () => {
      if (editando) {
        await atualizarJovem(editando.id, { nome: nome.trim(), patrulha: patrulha.trim() });
      } else {
        await criarJovem({ nome: nome.trim(), patrulha: patrulha.trim() });
      }
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

  const toggleSelecionarTodos = () => {
    if (selecionados.length === jovens.length) {
      setSelecionados([]);
    } else {
      setSelecionados(jovens.map(j => j.id));
    }
  };

  const toggleSelecionarJovem = (id: string) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter(item => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const excluirEmLote = async () => {
    if (!confirm(`Deseja realmente excluir os ${selecionados.length} jovens selecionados?`)) return;
    try {
      for (const id of selecionados) {
        await removerJovem(id);
      }
      toast.success("Jovens excluídos com sucesso!");
      setSelecionados([]);
      invalidar();
    } catch {
      toast.error("Erro ao excluir alguns jovens em lote.");
    }
  };

  // Verificação de perfil padronizada e insensível a maiúsculas/minúsculas
  if (String(perfil).toLowerCase() !== "chefe") {
    return (
      <AppShell>
        <Card className="m-6">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Tela exclusiva da chefia</p>
            <p className="text-xs text-muted-foreground">
              Alterne para a Visão do Chefe no topo da página para cadastrar e gerenciar jovens.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-amber-600" /> Gestão de Jovens da Tropa
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Controle de membros, registros UEB, patrulhas e ações em lote.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selecionados.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={excluirEmLote}
                className="flex items-center gap-1.5"
              >
                <Trash2 size={16} /> Excluir Selecionados ({selecionados.length})
              </Button>
            )}
            <Button
              onClick={() => {
                setEditando(null);
                setNome("");
                setPatrulha("");
                setDialogOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
            >
              <UserPlus size={18} /> Novo Jovem
            </Button>
          </div>
        </div>

        {/* Listagem de Jovens com Suporte a Seleção em Lote */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Carregando membros da tropa...</div>
            ) : jovens.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Nenhum jovem cadastrado até o momento.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-600">
                      <th className="p-4 w-10">
                        <button onClick={toggleSelecionarTodos} className="flex items-center text-slate-500">
                          {selecionados.length === jovens.length && jovens.length > 0 ? (
                            <CheckSquare size={18} className="text-amber-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                      <th className="p-4 font-semibold">Nome Completo</th>
                      <th className="p-4 font-semibold">Patrulha</th>
                      <th className="p-4 font-semibold">Registro UEB</th>
                      <th className="p-4 font-semibold">E-mail</th>
                      <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jovens.map((jovem) => {
                      const selecionado = selecionados.includes(jovem.id);
                      return (
                        <tr key={jovem.id} className={`hover:bg-slate-50/50 ${selecionado ? 'bg-amber-50/30' : ''}`}>
                          <td className="p-4">
                            <button onClick={() => toggleSelecionarJovem(jovem.id)} className="flex items-center text-slate-500">
                              {selecionado ? (
                                <CheckSquare size={18} className="text-amber-600" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{jovem.nome}</td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                              {jovem.patrulha || "Sem Patrulha"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{jovem.registro_ueb || "—"}</td>
                          <td className="p-4 text-slate-600">{jovem.email || "—"}</td>
                          <td className="p-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditando(jovem);
                                setNome(jovem.nome || "");
                                setPatrulha(jovem.patrulha || "");
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil size={16} className="text-slate-500 hover:text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Deseja excluir ${jovem.nome}?`)) {
                                  remover.mutate(jovem.id);
                                }
                              }}
                            >
                              <Trash2 size={16} className="text-slate-500 hover:text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Cadastro / Edição */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar Jovem" : "Cadastrar Novo Jovem"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                salvar.mutate();
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <Label className="mb-1 block">Nome Completo</Label>
                <Input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Pedro"
                />
              </div>
              <div>
                <Label className="mb-1 block">Patrulha</Label>
                <Input
                  value={patrulha}
                  onChange={(e) => setPatrulha(e.target.value)}
                  placeholder="Ex: Fênix, Harpia, Lobo Guará"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvar.isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {editando ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}