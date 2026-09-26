import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Compass, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembroProvider, type Membro } from "@/lib/membro";
import { fetchMeuMembro } from "@/lib/progressao";
import { useAppState } from "@/lib/app-state";

type Modo = "login" | "recuperar" | "nova-senha";

function Moldura({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-bold leading-tight">Progressão Escoteira</p>
            <p className="text-xs font-semibold text-primary">Tropa Artemis</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { setPerfil, setJovemId, setChefe } = useAppState();
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [membro, setMembro] = useState<Membro | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [semAcesso, setSemAcesso] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === "PASSWORD_RECOVERY") setModo("nova-senha");
      setSession(s);
      setCarregando(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setModo("nova-senha");
    }
    return () => sub.subscription.unsubscribe();
  }, []);

  // Confere se o e-mail autenticado está na lista da tropa.
  useEffect(() => {
    if (!session || modo === "nova-senha") return;
    let cancelado = false;
    setVerificando(true);
    fetchMeuMembro()
      .then((m) => {
        if (cancelado) return;
        setMembro(m);
        setSemAcesso(!m);
        if (m) {
          if (m.perfil === "CHEFE") {
            setPerfil("chefe");
            setChefe(m.nome);
          } else {
            setPerfil("escoteiro");
            setJovemId(m.id);
          }
        }
      })
      .catch(() => {
        if (!cancelado) toast.error("Não foi possível confirmar seu acesso. Tente novamente.");
      })
      .finally(() => !cancelado && setVerificando(false));
    return () => {
      cancelado = true;
    };
  }, [session, modo, setPerfil, setJovemId, setChefe]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setMembro(null);
    setSemAcesso(false);
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw error;
    } catch {
      toast.error("E-mail ou senha incorretos.");
    } finally {
      setEnviando(false);
    }
  }

  async function recuperar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success("Enviamos um link de redefinição para o seu e-mail.");
      setModo("login");
    } catch {
      toast.error("Não foi possível enviar o link. Confira o e-mail digitado.");
    } finally {
      setEnviando(false);
    }
  }

  async function salvarNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== senha2) {
      toast.error("As senhas não conferem.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada!");
      setSenha("");
      setSenha2("");
      if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
      setModo("login");
    } catch {
      toast.error("Não foi possível atualizar a senha. Peça um novo link.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Carregando…</div>;
  }

  if (modo === "nova-senha") {
    return (
      <Moldura>
        <form onSubmit={salvarNovaSenha} className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Definir nova senha</p>
          <div className="space-y-1.5">
            <Label htmlFor="nova">Nova senha</Label>
            <Input id="nova" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nova2">Confirmar nova senha</Label>
            <Input id="nova2" type="password" required value={senha2} onChange={(e) => setSenha2(e.target.value)} placeholder="••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar nova senha"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setModo("login")}>
            Voltar
          </Button>
        </form>
      </Moldura>
    );
  }

  if (session) {
    if (verificando) {
      return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Confirmando seu acesso…</div>;
    }
    if (semAcesso) {
      return (
        <Moldura>
          <div className="mt-6 space-y-3 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <p className="text-sm font-semibold">Acesso não autorizado</p>
            <p className="text-xs text-muted-foreground">
              Este e-mail ainda não foi cadastrado pela chefia da Tropa Artemis. Procure seus chefes para liberar o acesso.
            </p>
            <Button variant="outline" className="w-full" onClick={sair}>
              Sair
            </Button>
          </div>
        </Moldura>
      );
    }
    if (membro) {
      return <MembroProvider membro={membro}>{children}</MembroProvider>;
    }
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Carregando…</div>;
  }

  if (modo === "recuperar") {
    return (
      <Moldura>
        <form onSubmit={recuperar} className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Recuperar acesso</p>
          <p className="text-xs text-muted-foreground">Enviaremos um link para você criar uma nova senha.</p>
          <div className="space-y-1.5">
            <Label htmlFor="email-rec">E-mail</Label>
            <Input id="email-rec" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setModo("login")}>
            Voltar para o login
          </Button>
        </form>
      </Moldura>
    );
  }

  return (
    <Moldura>
      <form onSubmit={entrar} className="mt-6 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setModo("recuperar")}
        className="mt-3 w-full text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Esqueci minha senha
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Acesso exclusivo para membros cadastrados da Tropa Artemis.
      </p>
    </Moldura>
  );
}
