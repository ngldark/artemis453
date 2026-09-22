import { useEffect, useState, type ReactNode } from "react";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setCarregando(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrarComGoogle() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch {
      toast.error("Não foi possível entrar com o Google.");
    }
  }

  if (carregando) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Carregando…</div>;
  }

  if (session) return <>{children}</>;

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

        <form onSubmit={submeter} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button variant="outline" className="mt-3 w-full" onClick={entrarComGoogle}>
          Entrar com Google
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Acesso exclusivo para membros da Tropa Artemis.
        </p>
      </div>
    </div>
  );
}
